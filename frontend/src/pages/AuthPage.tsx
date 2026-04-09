import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { SurfaceCard } from "../components/ui/SurfaceCard";
import { useAuth } from "../context/AuthContext";
import { isDemoMode, isNetlifyHost } from "../api";
import { resetApplicationData } from "../utils/resetApp";

type Props = {
  mode: "login" | "register";
};

export function AuthPage({ mode }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(() => {
    const state = location.state as { email?: string } | null;
    return state?.email ?? "";
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  if (user) {
    return <Navigate to="/workspaces" replace />;
  }

  const isRegister = mode === "register";
  const duplicateEmail = isRegister && error.toLowerCase().includes("email is already in use");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate("/workspaces");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to continue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    setError("");
    setNotice("");
    setResetting(true);

    try {
      const result = await resetApplicationData();
      if (!result.reset) {
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      setNotice("The app has been reset. You can create a fresh account now.");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to reset the app");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-frame">
        <SurfaceCard className="auth-story-panel" tone="gradient">
          <div className="auth-story-top">
            <span className="sidebar-brand">Task Manager</span>
            <Button variant="icon" aria-label="Design highlight">
              <Icon name="menu" size={16} />
            </Button>
          </div>

          <div className="auth-story-copy">
            <span className="section-eyebrow">
              <Icon name="workspace" size={14} />
              Group 2 Project
            </span>
            <h1>Task Management System</h1>
            <p>
              Create workspaces and manage tasks with a simple flow: create, update, view, and delete tasks.
            </p>
          </div>

          <div className="auth-preview-card">
            <div className="auth-preview-header">
              <strong>Core features</strong>
              <span>Simple workflow</span>
            </div>
            <div className="auth-preview-metrics">
              <div>
                <span>Task actions</span>
                <strong>4</strong>
              </div>
              <div>
                <span>Main views</span>
                <strong>2</strong>
              </div>
            </div>
            <div className="auth-preview-list">
              <div className="auth-preview-row">
                <span className="status-dot status-dot-blue" />
                <span>Create and view tasks</span>
              </div>
              <div className="auth-preview-row">
                <span className="status-dot status-dot-amber" />
                <span>Update status and priority</span>
              </div>
              <div className="auth-preview-row">
                <span className="status-dot status-dot-violet" />
                <span>Delete tasks when needed</span>
              </div>
            </div>
            <Button
              type="button"
              variant="danger"
              size="sm"
              className="auth-reset-button"
              disabled={resetting}
              iconLeft={<Icon name="trash" size={15} />}
              onClick={() => void handleReset()}
            >
              {resetting ? "Resetting..." : "Reset app data"}
            </Button>
          </div>
        </SurfaceCard>

        <SurfaceCard className="auth-form-panel">
          <div className="auth-form-header">
            <span className="section-eyebrow">
              <Icon name="user" size={14} />
              {isRegister ? "Create account" : "Welcome back"}
            </span>
            <h2>{isRegister ? "Create your account" : "Sign in to continue"}</h2>
            <p className="page-subtitle">
              Sign in to your workspace and manage tasks with a simple task board.
            </p>
          </div>

          {isDemoMode ? (
            <p className="info-banner">
              Demo mode is active on this Netlify site. Accounts, workspaces, tasks, and comments are saved in this
              browser so you can use the app without a separate backend.
            </p>
          ) : isNetlifyHost ? (
            <p className="info-banner">
              If login or registration fails on Netlify, connect a public backend and set
              <code> VITE_API_BASE_URL </code>
              for this site.
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="form-stack">
            {isRegister && (
              <label className="field-group">
                <span className="field-label">Full Name</span>
                <input
                  className="app-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Team member name"
                />
              </label>
            )}

            <label className="field-group">
              <span className="field-label">Email</span>
              <input
                className="app-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label className="field-group">
              <span className="field-label">Password</span>
              <input
                className="app-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
              />
            </label>

            {notice ? <p className="success-banner">{notice}</p> : null}

            {error && (
              <div className="auth-error-stack">
                <p className="error-banner">
                  {duplicateEmail ? "This email already has an account. Sign in instead." : error}
                </p>
                {duplicateEmail ? (
                  <Button
                    type="button"
                    variant="ghost"
                    iconLeft={<Icon name="user" size={16} />}
                    onClick={() => navigate("/login", { state: { email } })}
                  >
                    Go to sign in
                  </Button>
                ) : null}
              </div>
            )}

            <Button type="submit" disabled={submitting} iconLeft={<Icon name="arrowRight" size={16} />}>
              {submitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="auth-switch-copy">
            {isRegister ? "Already have an account?" : "Need an account?"}{" "}
            <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Register"}</Link>
          </p>
        </SurfaceCard>
      </div>
    </div>
  );
}
