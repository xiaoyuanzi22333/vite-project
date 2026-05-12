import { Button, Divider, Modal, Popover } from "antd";
import { useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import styles from "./AuthFloatingStatus.module.css";

function shortName(username: string) {
  const u = username.trim();
  if (!u) return "User";
  return u.length > 16 ? `${u.slice(0, 16)}…` : u;
}

export function AuthFloatingStatus() {
  const { user, isAuthed, isLoading, login, logout, register } = useAuth();
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [inputNonce, setInputNonce] = useState(0);

  const pillText = useMemo(() => {
    if (isLoading) return "…";
    return isAuthed && user ? `@${shortName(user)}` : "Guest";
  }, [isAuthed, user, isLoading]);

  const popoverContent = (
    <div className={styles.popover}>
      <div className={styles.row}>
        <div>
          <div className={styles.label}>
            {isLoading ? "Checking…" : isAuthed ? "Logged in" : "Not logged in"}
          </div>
          <div className={styles.muted}>
            {isLoading ? "Please wait." : isAuthed && user ? `as ${user}` : "Sign in to use Chat."}
          </div>
        </div>
      </div>

      <Divider style={{ margin: "10px 0" }} />

      {isAuthed ? (
        <div className={styles.actions}>
          <Button
            block
              onClick={async () => {
                await logout();
                setOpen(false);
              }}
          >
            Logout
          </Button>
        </div>
      ) : (
        <div className={styles.actions}>
          <Button
            type="primary"
            block
            onClick={() => {
              setOpen(false);
              setMode("login");
              setUsername("");
              setPassword("");
              setPassword2("");
              setError(null);
              setSubmitting(false);
              setInputNonce((n) => n + 1); // remount inputs to defeat browser autofill
              setLoginOpen(true);
            }}
            disabled={isLoading}
          >
            Login
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Popover
        open={open}
        onOpenChange={setOpen}
        placement="bottomRight"
        content={popoverContent}
        trigger="click"
      >
        <div className={`theme-float-shell ${styles.pill}`} role="button" tabIndex={0}>
          <span className={`${styles.dot} ${isAuthed ? styles.dotAuthed : ""}`} />
          <span className={styles.label}>{pillText}</span>
        </div>
      </Popover>

      <Modal
        open={loginOpen}
        title={mode === "login" ? "Login" : "Register"}
        onCancel={() => {
          setLoginOpen(false);
          setError(null);
        }}
        footer={null}
        destroyOnClose
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div className={styles.muted}>Username</div>
            <input
              key={`u-${inputNonce}-${mode}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              name="app_username"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Enter username"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--app-input-border)",
                background: "var(--app-input-bg)",
                color: "var(--app-input-text)",
                outline: "none",
              }}
            />
          </div>
          <div>
            <div className={styles.muted}>Password</div>
            <input
              key={`p-${inputNonce}-${mode}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              name="app_password"
              autoComplete="new-password"
              placeholder="••••••"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--app-input-border)",
                background: "var(--app-input-bg)",
                color: "var(--app-input-text)",
                outline: "none",
              }}
            />
          </div>

          {mode === "register" ? (
            <div>
              <div className={styles.muted}>Confirm password</div>
              <input
                key={`p2-${inputNonce}-${mode}`}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                type="password"
                name="app_password2"
                autoComplete="new-password"
                placeholder="••••••"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--app-input-border)",
                  background: "var(--app-input-bg)",
                  color: "var(--app-input-text)",
                  outline: "none",
                }}
              />
            </div>
          ) : null}

          {error ? <div className={styles.error}>{error}</div> : null}

          <div className={styles.actions}>
            <Button
              type={mode === "login" ? "primary" : "default"}
              block
              loading={submitting}
              disabled={submitting}
              onClick={async () => {
                setError(null);
                setSubmitting(true);
                try {
                  const res = await login(username, password);
                  if (!res.ok) setError(res.error);
                  else setLoginOpen(false);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              Login
            </Button>
            <Button
              type={mode === "register" ? "primary" : "default"}
              block
              loading={submitting}
              disabled={submitting}
              onClick={async () => {
                setError(null);
                if (mode !== "register") {
                  setMode("register");
                  return;
                }
                if (password !== password2) {
                  setError("Passwords do not match.");
                  return;
                }
                setSubmitting(true);
                try {
                  const res = await register(username, password);
                  if (!res.ok) setError(res.error);
                  else setLoginOpen(false);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {mode === "register" ? "Register" : "Switch to register"}
            </Button>
          </div>

          <div className={styles.muted} />
        </div>
      </Modal>
    </>
  );
}

