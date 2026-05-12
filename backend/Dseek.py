import os
import sqlite3
from datetime import datetime, timezone
from flask import Flask, Response, request, jsonify, session
from flask_cors import CORS
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
import json
import urllib.error
import urllib.request
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)

# --- Auth / session configuration ---
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-change-me")

ALLOWED_ORIGINS = [
    "https://xyzhoho.com",
    "http://xyzhoho.com",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Allow cookies across origins (frontend on :8000, backend on :6000).
CORS(
    app,
    resources={r"/*": {"origins": ALLOWED_ORIGINS}},
    supports_credentials=True,
)

DB_PATH = os.getenv("AUTH_DB_PATH", os.path.join(os.path.dirname(__file__), "auth.sqlite3"))


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_auth_db() -> None:
    conn = get_db()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT NOT NULL UNIQUE,
              password_hash TEXT NOT NULL,
              is_admin INTEGER NOT NULL DEFAULT 0,
              created_at TEXT NOT NULL,
              last_login_at TEXT
            )
            """
        )
        conn.commit()
    finally:
        conn.close()


def ensure_super_admin() -> None:
    """
    Seed a super admin user if SUPER_ADMIN_USER/PASS are set.
    Safe to run multiple times.
    """
    username = (os.getenv("SUPER_ADMIN_USER") or "").strip()
    password = os.getenv("SUPER_ADMIN_PASS") or ""
    if not username or not password:
        return
    conn = get_db()
    try:
        row = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
        if row:
            return
        conn.execute(
            """
            INSERT INTO users (username, password_hash, is_admin, created_at, last_login_at)
            VALUES (?, ?, 1, ?, NULL)
            """,
            (username, generate_password_hash(password), _utc_now_iso()),
        )
        conn.commit()
    finally:
        conn.close()


# Initialize auth storage eagerly so running via gunicorn/flask run doesn't skip it.
try:
    init_auth_db()
    ensure_super_admin()
except Exception:
    # Avoid crashing the whole app on boot; auth endpoints will fail loudly if DB is truly broken.
    pass


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})


@app.route("/auth/me", methods=["GET"])
def auth_me():
    u = session.get("user")
    if not u:
        return jsonify({"ok": True, "user": None})
    return jsonify({"ok": True, "user": {"username": u.get("username"), "isAdmin": bool(u.get("is_admin"))}})


@app.route("/auth/logout", methods=["POST"])
def auth_logout():
    session.pop("user", None)
    return jsonify({"ok": True})


@app.route("/auth/register", methods=["POST"])
def auth_register():
    payload = request.get_json(silent=True) or {}
    username = str(payload.get("username") or "").strip()
    password = str(payload.get("password") or "")
    if len(username) < 2:
        return jsonify({"ok": False, "error": "Username must be at least 2 characters."}), 400
    if len(password) < 3:
        return jsonify({"ok": False, "error": "Password must be at least 3 characters."}), 400

    conn = get_db()
    try:
        existing = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
        if existing:
            return jsonify({"ok": False, "error": "Username already exists."}), 409
        conn.execute(
            """
            INSERT INTO users (username, password_hash, is_admin, created_at, last_login_at)
            VALUES (?, ?, 0, ?, ?)
            """,
            (username, generate_password_hash(password), _utc_now_iso(), _utc_now_iso()),
        )
        conn.commit()
    finally:
        conn.close()

    session["user"] = {"username": username, "is_admin": 0}
    return jsonify({"ok": True, "user": {"username": username, "isAdmin": False}})


@app.route("/auth/login", methods=["POST"])
def auth_login():
    payload = request.get_json(silent=True) or {}
    username = str(payload.get("username") or "").strip()
    password = str(payload.get("password") or "")
    if not username or not password:
        return jsonify({"ok": False, "error": "Username and password are required."}), 400

    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id, username, password_hash, is_admin FROM users WHERE username = ?",
            (username,),
        ).fetchone()
        if not row or not check_password_hash(row["password_hash"], password):
            return jsonify({"ok": False, "error": "Invalid username or password."}), 401
        conn.execute(
            "UPDATE users SET last_login_at = ? WHERE id = ?",
            (_utc_now_iso(), row["id"]),
        )
        conn.commit()
        session["user"] = {"username": row["username"], "is_admin": int(row["is_admin"])}
        return jsonify(
            {"ok": True, "user": {"username": row["username"], "isAdmin": bool(row["is_admin"])}}
        )
    finally:
        conn.close()

def _openai_compatible_sse_stream(*, base_url: str, model: str, user_text: str):
    """
    Stream tokens from an OpenAI-compatible server (e.g. vLLM) using SSE:
    POST {base}/v1/chat/completions with stream=true
    """
    url = f"{base_url.rstrip('/')}/v1/chat/completions"
    body = json.dumps(
        {
            "model": model,
            "stream": True,
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_text},
            ],
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        },
    )

    try:
        resp = urllib.request.urlopen(req, timeout=600)  # nosec - user-controlled internal URL in practice
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        yield f"data: Error: HTTP {e.code}: {err_body[:500]}\n\n"
        return
    except Exception as e:
        yield f"data: Error: {e}\n\n"
        return

    decoder = resp.headers.get_content_charset() or "utf-8"
    buffer = b""
    try:
        while True:
            chunk = resp.read(4096)
            if not chunk:
                break
            buffer += chunk
            while b"\n" in buffer:
                line, buffer = buffer.split(b"\n", 1)
                s = line.decode(decoder, errors="replace").strip()
                if not s or s.startswith(":"):
                    continue
                if not s.startswith("data:"):
                    continue
                data = s[len("data:") :].strip()
                if data == "[DONE]":
                    yield "data: [DONE]\n\n"
                    return
                try:
                    payload = json.loads(data)
                except json.JSONDecodeError:
                    continue
                choices = payload.get("choices") if isinstance(payload, dict) else None
                if not choices or not isinstance(choices, list):
                    continue
                delta = choices[0].get("delta") if isinstance(choices[0], dict) else None
                if not isinstance(delta, dict):
                    continue
                delta_content = delta.get("content")
                if isinstance(delta_content, str) and delta_content:
                    yield f"data: {delta_content}\n\n"
    finally:
        try:
            resp.close()
        except Exception:
            pass


def stream_input(input_content="introduce yourself"):
    """
    LLM routing:
    - If AZURE_INFERENCE_SDK_ENDPOINT + AZURE_INFERENCE_SDK_KEY are set, use Azure SDK.
    - Otherwise, use OpenAI-compatible HTTP streaming against LLM_BASE_URL (defaults to your vLLM host).
    """
    azure_endpoint = (os.getenv("AZURE_INFERENCE_SDK_ENDPOINT") or "").strip()
    azure_key = (os.getenv("AZURE_INFERENCE_SDK_KEY") or "").strip()
    azure_model = (os.getenv("DEPLOYMENT_NAME") or os.getenv("AZURE_DEPLOYMENT_NAME") or "").strip()

    if azure_endpoint and azure_key and azure_model:
        client = ChatCompletionsClient(endpoint=azure_endpoint, credential=AzureKeyCredential(azure_key))
        try:
            response = client.complete(
                messages=[
                    SystemMessage(content="You are a helpful assistant."),
                    UserMessage(content=input_content),
                ],
                model=azure_model,
                max_tokens=1000,
                stream=True,
            )

            for chunk in response:
                if isinstance(chunk, str):
                    if chunk.startswith("data: "):
                        json_data = chunk[len("data: ") :].strip()
                        if json_data == "[DONE]":
                            yield "data: [DONE]\n\n"
                            break
                        try:
                            parsed_chunk = json.loads(json_data)
                            if "choices" in parsed_chunk and parsed_chunk["choices"]:
                                delta_content = parsed_chunk["choices"][0]["delta"].get("content")
                                if delta_content is not None:
                                    yield f"data: {delta_content}\n\n"
                        except json.JSONDecodeError:
                            continue
                else:
                    try:
                        if chunk.choices and chunk.choices[0].delta.content is not None:
                            yield f"data: {chunk.choices[0].delta.content}\n\n"
                    except AttributeError:
                        continue
        except Exception as e:
            yield f"data: Error: {e}\n\n"
        return

    base_url = (os.getenv("LLM_BASE_URL") or "http://100.100.102.102:8000").strip()
    model = (os.getenv("LLM_MODEL") or "glm-4.7-flash").strip()
    yield from _openai_compatible_sse_stream(base_url=base_url, model=model, user_text=input_content)

@app.route('/stream', methods=['GET'])
def stream():
    # 从查询参数获取输入内容，默认值是 "introduce yourself"
    input_content = request.args.get('input', default="introduce yourself")
    
    # 返回流式响应，指定 MIME 类型为 text/event-stream
    return Response(stream_input(input_content), mimetype='text/event-stream')

if __name__ == '__main__':
    init_auth_db()
    ensure_super_admin()
    app.run(host='0.0.0.0', port=6000, debug=True)