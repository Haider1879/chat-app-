import { useEffect, useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { api, json, type User } from "../api";
type AuthMode = "login" | "register" | "forgot" | "reset" | "verify";
export default function AuthPage({
  onLogin,
}: {
  onLogin: (token: string, user: User) => void;
}) {
  const [mode, setMode] = useState<AuthMode>(() =>
    location.pathname.startsWith("/reset-password/")
      ? "reset"
      : location.pathname.startsWith("/verify-email/")
        ? "verify"
        : "login",
  );
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (mode !== "verify") return;
    const token = location.pathname.split("/").pop();
    api<{ message: string }>(`/api/auth/verify-email/${token}`)
      .then((r) => {
        setNotice(r.message || "Email verified. You can sign in.");
        setMode("login");
        history.replaceState({}, "", "/");
      })
      .catch((e) => setError(e.message));
  }, [mode]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "forgot") {
        const r = await api<{ message: string }>(
          "/api/auth/forgot-password",
          json("POST", { email: form.email }),
        );
        setNotice(r.message);
        return;
      }
      if (mode === "reset") {
        const token = location.pathname.split("/").pop();
        const r = await api<{ message: string }>(
          `/api/auth/reset-password/${token}`,
          json("POST", { password: form.password }),
        );
        setNotice(r.message);
        setMode("login");
        history.replaceState({}, "", "/");
        return;
      }
      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : form;
      const r = await api<{ token: string; user: User; message: string }>(
        `/api/auth/${mode}`,
        json("POST", body),
      );
      onLogin(r.token, r.user);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-layout">
      <section className="auth-art">
        <div className="brand brand-light">
          <span className="brand-mark">
            r<span>.</span>
          </span>
          <span>ring</span>
        </div>
        <div className="auth-art-copy">
          <div className="floating-orb orb-one" />
          <div className="floating-orb orb-two" />
          <div className="floating-orb orb-three" />
          <p className="eyebrow">THE SPACE BETWEEN US</p>
          <h1>
            Good conversations
            <br />
            bring us <em>closer.</em>
          </h1>
          <p>
            Share a moment, send a thought, stay connected. Your people are only
            a message away.
          </p>
        </div>
        <div className="auth-foot">
          A little closer, every day <span>✳</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="mobile-brand brand">
          <span className="brand-mark">
            r<span>.</span>
          </span>
          <span>ring</span>
        </div>
        <div className="auth-card">
          <div className="auth-icon">
            <MessageCircle size={24} />
          </div>
          <h2>
            {mode === "login"
              ? "Welcome back"
              : mode === "register"
                ? "Make yourself at home"
                : mode === "forgot"
                  ? "Reset your password"
                  : mode === "reset"
                    ? "Choose a new password"
                    : "Verifying your email"}
          </h2>
          <p className="muted">
            {mode === "login"
              ? "Your conversations are waiting for you."
              : mode === "register"
                ? "Create an account and start connecting."
                : mode === "forgot"
                  ? "We’ll send a reset link if the address is registered."
                  : mode === "reset"
                    ? "Enter a password of at least 8 characters."
                    : "Please wait a moment."}
          </p>
          {mode !== "verify" && (
            <form onSubmit={submit} className="auth-form">
              {mode === "register" && (
                <>
                  <label>
                    Full name
                    <input
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Your name"
                    />
                  </label>
                  <label>
                    Username
                    <input
                      required
                      minLength={3}
                      value={form.username}
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                      placeholder="your.username"
                    />
                  </label>
                </>
              )}
              {mode !== "reset" && (
                <label>
                  Email address
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="you@example.com"
                  />
                </label>
              )}
              {mode === "register" && (
                <div className="auth-row">
                  <label>
                    Phone number
                    <input
                      required
                      value={form.phoneNumber}
                      onChange={(e) =>
                        setForm({ ...form, phoneNumber: e.target.value })
                      }
                      placeholder="+92..."
                    />
                  </label>
                  <label>
                    Date of birth
                    <input
                      required
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) =>
                        setForm({ ...form, dateOfBirth: e.target.value })
                      }
                    />
                  </label>
                </div>
              )}
              {mode !== "forgot" && (
                <label>
                  Password
                  <input
                    required
                    type="password"
                    minLength={mode === "login" ? 1 : 8}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                </label>
              )}
              {mode === "login" && (
                <button
                  className="text-link forgot"
                  type="button"
                  onClick={() => setMode("forgot")}
                >
                  Forgot password?
                </button>
              )}
              {error && <div className="alert error">{error}</div>}
              {notice && <div className="alert">{notice}</div>}
              <button className="primary full" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : mode === "login"
                    ? "Sign in"
                    : mode === "register"
                      ? "Create account"
                      : mode === "forgot"
                        ? "Send reset link"
                        : "Reset password"}{" "}
                <span>→</span>
              </button>
            </form>
          )}
          {mode === "verify" && error && (
            <div className="alert error">{error}</div>
          )}
          <div className="auth-switch">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button onClick={() => setMode("register")}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("login")}>Sign in</button>
              </>
            )}
          </div>
        </div>
        <p className="auth-bottom">Made for the conversations that matter.</p>
      </section>
    </div>
  );
}
