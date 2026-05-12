import sqlite3
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash
DB="/home/hoho/vite-project/auth.sqlite3"
username="hoho"
password="711123"
now = datetime.now(timezone.utc).isoformat()
con = sqlite3.connect(DB)
try:
    con.execute("""
      INSERT INTO users (username, password_hash, is_admin, created_at, last_login_at)
      VALUES (?, ?, 1, ?, NULL)
    """, (username, generate_password_hash(password), now))
    con.commit()
    print("OK: inserted", username)
except sqlite3.IntegrityError as e:
    print("FAILED:", e)
finally:
    con.close()