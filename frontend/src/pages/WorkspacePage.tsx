import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import type { Workspace } from "../types";

export function WorkspacePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      const data = await api.get<Workspace[]>("/api/workspaces");
      setWorkspaces(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWorkspaces();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      const workspace = await api.post<Workspace>("/api/workspaces", {
        name: workspaceName,
        description: workspaceDescription,
      });
      navigate(`/workspace/${workspace.id}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to create workspace");
    }
  };

  const handleJoin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      const workspace = await api.post<Workspace>("/api/workspaces/join", { inviteCode });
      navigate(`/workspace/${workspace.id}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to join workspace");
    }
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Welcome back</span>
          <h1>{user?.name}'s workspaces</h1>
        </div>
        <button
          className="ghost-button"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          Sign out
        </button>
      </header>

      {error && <p className="error-banner">{error}</p>}

      <section className="workspace-grid">
        <div className="panel">
          <h2>Your collaborative spaces</h2>
          <p className="muted">Open an existing board or create a new workspace for your team.</p>

          {loading ? (
            <p className="muted">Loading workspaces...</p>
          ) : workspaces.length === 0 ? (
            <p className="muted">No workspace yet. Create one to get started.</p>
          ) : (
            <div className="workspace-list">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  className="workspace-card"
                  onClick={() => navigate(`/workspace/${workspace.id}`)}
                >
                  <div>
                    <strong>{workspace.name}</strong>
                    <p>{workspace.description ?? "No description"}</p>
                  </div>
                  <div className="workspace-meta">
                    <span>{workspace.role}</span>
                    <code>{workspace.inviteCode}</code>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="stack">
          <div className="panel">
            <h2>Create workspace</h2>
            <form className="stack" onSubmit={handleCreate}>
              <label>
                Workspace name
                <input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} />
              </label>
              <label>
                Description
                <textarea
                  value={workspaceDescription}
                  onChange={(event) => setWorkspaceDescription(event.target.value)}
                  rows={4}
                />
              </label>
              <button type="submit" className="primary-button">
                Create workspace
              </button>
            </form>
          </div>

          <div className="panel">
            <h2>Join by invite code</h2>
            <form className="stack" onSubmit={handleJoin}>
              <label>
                Invite code
                <input value={inviteCode} onChange={(event) => setInviteCode(event.target.value.toUpperCase())} />
              </label>
              <button type="submit" className="secondary-button">
                Join workspace
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
