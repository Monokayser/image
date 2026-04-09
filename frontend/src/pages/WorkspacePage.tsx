import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, isDemoMode } from "../api";
import { AppSidebar } from "../components/AppSidebar";
import { AppTopbar } from "../components/AppTopbar";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { MetricCard } from "../components/ui/MetricCard";
import { SurfaceCard } from "../components/ui/SurfaceCard";
import { useAuth } from "../context/AuthContext";
import type { Workspace } from "../types";
import { formatDate, formatRole } from "../utils/format";
import { resetApplicationData } from "../utils/resetApp";

export function WorkspacePage() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [resetting, setResetting] = useState(false);
  const menuItems = [
    {
      key: "workspaces",
      label: "Workspaces",
      icon: "workspace" as const,
      active: true,
      onClick: () => navigate("/workspaces"),
      meta: `${workspaces.length}`,
    },
  ];
  const ownerCount = workspaces.filter((workspace) => workspace.role === "OWNER").length;
  const memberCount = workspaces.filter((workspace) => workspace.role === "MEMBER").length;

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
    setCreating(true);
    try {
      const workspace = await api.post<Workspace>("/api/workspaces", {
        name: workspaceName.trim(),
        description: workspaceDescription.trim(),
      });
      setWorkspaceName("");
      setWorkspaceDescription("");
      navigate(`/workspace/${workspace.id}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to create workspace");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setJoining(true);
    try {
      const workspace = await api.post<Workspace>("/api/workspaces/join", { inviteCode: inviteCode.trim() });
      setInviteCode("");
      navigate(`/workspace/${workspace.id}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to join workspace");
    } finally {
      setJoining(false);
    }
  };

  const handleReset = async () => {
    setError("");
    setResetting(true);
    try {
      const result = await resetApplicationData();
      if (!result.reset) {
        return;
      }
      await refreshUser();
      navigate("/login", { replace: true });
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to reset the app");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="app-page">
      <div className="app-frame">
        <AppSidebar
          userName={user?.name}
          userEmail={user?.email}
          menuItems={menuItems}
          workspaces={workspaces}
          onWorkspaceSelect={(id) => navigate(`/workspace/${id}`)}
          onLogout={async () => {
            await logout();
            navigate("/login");
          }}
        />

        <main className="dashboard-stage workspace-stage">
          <AppTopbar
            title="Workspaces"
            userName={user?.name}
            searchPlaceholder="Search workspace name"
            onReset={handleReset}
            resetDisabled={resetting}
          />

          <section className="hero-panel">
            <div className="hero-copy">
              <span className="section-eyebrow">
                <Icon name="sparkles" size={14} />
                Task Management System
              </span>
              <h1>Your workspaces</h1>
              <p className="page-subtitle">
                Create a workspace, join with an invite code, and open a board to create, update, view, or delete tasks.
              </p>
            </div>
            <Button
              variant="ghost"
              iconLeft={<Icon name="logout" size={16} />}
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
            >
              Sign out
            </Button>
          </section>

          {isDemoMode ? (
            <p className="info-banner">
              Demo mode is active on Netlify. Everything you create here is stored in this browser, and the reset button
              clears the demo data.
            </p>
          ) : null}

          {error && <p className="error-banner">{error}</p>}

          <section className="stats-grid">
            <MetricCard
              title="Total Workspaces"
              value={workspaces.length}
              leadingLabel={`${ownerCount} owned`}
              trailingLabel={`${memberCount} joined`}
              progress={workspaces.length === 0 ? 8 : (ownerCount / Math.max(workspaces.length, 1)) * 100}
              accent="blue"
              icon={<Icon name="workspace" size={16} />}
            />
            <MetricCard
              title="Owned"
              value={ownerCount}
              leadingLabel={`${ownerCount} owner`}
              trailingLabel={`${Math.max(workspaces.length - ownerCount, 0)} shared`}
              progress={(ownerCount / Math.max(workspaces.length, 1)) * 100}
              accent="amber"
              icon={<Icon name="user" size={16} />}
            />
            <MetricCard
              title="Joined"
              value={memberCount}
              leadingLabel={`${memberCount} member`}
              trailingLabel={`${workspaces.length} total`}
              progress={(memberCount / Math.max(workspaces.length, 1)) * 100}
              accent="violet"
              icon={<Icon name="team" size={16} />}
            />
            <MetricCard
              title="Ready Boards"
              value={workspaces.length}
              leadingLabel="Invite ready"
              trailingLabel="Board enabled"
              progress={workspaces.length > 0 ? 100 : 8}
              accent="rose"
              icon={<Icon name="hash" size={16} />}
            />
          </section>

          <section className="workspace-layout">
            <SurfaceCard className="workspace-library">
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">
                    <Icon name="workspace" size={14} />
                    Workspaces
                  </span>
                  <h2>Select a workspace</h2>
                </div>
                <span className="section-meta">{workspaces.length} total</span>
              </div>

              {loading ? (
                <div className="empty-state">
                  <Icon name="sparkles" size={18} />
                  <span>Loading workspaces...</span>
                </div>
              ) : workspaces.length === 0 ? (
                <div className="empty-state">
                  <Icon name="workspace" size={18} />
                  <span>No workspace yet. Create one to get started.</span>
                </div>
              ) : (
                <div className="workspace-card-list">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      className="workspace-overview-card"
                      onClick={() => navigate(`/workspace/${workspace.id}`)}
                    >
                      <div className="workspace-overview-header">
                        <div>
                          <strong>{workspace.name}</strong>
                          <p>{workspace.description ?? "No description added yet."}</p>
                        </div>
                        <span className="workspace-role-chip">{formatRole(workspace.role)}</span>
                      </div>

                      <div className="workspace-overview-footer">
                        <span className="meta-inline">
                          <Icon name="hash" size={14} />
                          {workspace.inviteCode}
                        </span>
                        <span className="meta-inline">
                          <Icon name="calendar" size={14} />
                          {formatDate(workspace.createdAt.slice(0, 10), "Recently created")}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </SurfaceCard>

            <div className="workspace-side-panels">
              <SurfaceCard className="form-panel" tone="soft">
                <div className="section-heading">
                  <div>
                    <span className="section-eyebrow">
                      <Icon name="plus" size={14} />
                      Create
                    </span>
                    <h2>Create workspace</h2>
                  </div>
                </div>

                <form className="form-stack" onSubmit={handleCreate}>
                  <label className="field-group">
                    <span className="field-label">Workspace name</span>
                    <input
                      className="app-input"
                      value={workspaceName}
                      onChange={(event) => setWorkspaceName(event.target.value)}
                      maxLength={120}
                      required
                    />
                  </label>
                  <label className="field-group">
                    <span className="field-label">Description</span>
                    <textarea
                      className="app-input app-textarea"
                      value={workspaceDescription}
                      onChange={(event) => setWorkspaceDescription(event.target.value)}
                      rows={4}
                      maxLength={500}
                    />
                  </label>
                  <Button type="submit" disabled={creating} iconLeft={<Icon name="plus" size={16} />}>
                    {creating ? "Creating..." : "Create workspace"}
                  </Button>
                </form>
              </SurfaceCard>

              <SurfaceCard className="form-panel">
                <div className="section-heading">
                  <div>
                    <span className="section-eyebrow">
                      <Icon name="hash" size={14} />
                      Join
                    </span>
                    <h2>Join by invite code</h2>
                  </div>
                </div>

                <form className="form-stack" onSubmit={handleJoin}>
                  <label className="field-group">
                    <span className="field-label">Invite code</span>
                    <input
                      className="app-input"
                      value={inviteCode}
                      onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                      maxLength={8}
                      required
                    />
                  </label>
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={joining}
                    iconLeft={<Icon name="arrowRight" size={16} />}
                  >
                    {joining ? "Joining..." : "Join workspace"}
                  </Button>
                </form>
              </SurfaceCard>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
