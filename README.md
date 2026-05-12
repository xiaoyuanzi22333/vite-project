# Steve's Home

A personal website (React + Vite) with:
- **Frontend**: pages + router UI
- **Backend**: Flask auth/session APIs + LLM streaming endpoint

## Requirements
- **Node.js**: recommended 18+ (or 20+)
- **Python**: 3.10+

## Quick start
### 1) Frontend
```bash
npm install
npm run dev
```

By default the dev server runs on **http://localhost:8000** (see `vite.config.ts`).

### 2) Backend (Flask)
Create your `.env` first:
```bash
cp .env.example .env
```

Then run:
```bash
python backend/Dseek.py
```

Backend listens on **http://127.0.0.1:6000** and serves:
- **Auth APIs**: `/auth/*` (cookie session)
- **Health**: `/health`
- **LLM stream (SSE)**: `/stream?input=...`

## Environment variables
See `.env.example`.

- **Frontend**
  - `VITE_AUTH_BASE_URL`: auth backend base URL (optional). If empty, frontend calls same-origin `/auth/*`.

- **Backend (Flask)**
  - `FLASK_SECRET_KEY`: required for cookie sessions
  - `AUTH_DB_PATH`: sqlite path for auth DB (defaults to `backend/auth.sqlite3` if not set)
  - `SUPER_ADMIN_USER` / `SUPER_ADMIN_PASS`: optional one-time admin seed on backend startup

- **LLM routing**
  - Default path (if Azure vars are not set): OpenAI-compatible server at `LLM_BASE_URL` with model `LLM_MODEL`
  - Optional Azure path (only used if all are set): `AZURE_INFERENCE_SDK_ENDPOINT`, `AZURE_INFERENCE_SDK_KEY`, `DEPLOYMENT_NAME`

## Dev proxy (frontend -> backend)
During development, Vite proxies **`/auth` -> `http://127.0.0.1:6000`** (see `vite.config.ts`).
That means the frontend can call `/auth/me` without worrying about CORS.

## User management
- You can register via API: `POST /auth/register`
- Or seed an admin via `.env`: `SUPER_ADMIN_USER` + `SUPER_ADMIN_PASS`
- A helper script exists: `add_user.py` (it inserts a user into sqlite). Review/edit it before use.