import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, isDemoMode } from "../api";
import { AppSidebar } from "../components/AppSidebar";
import { AppTopbar } from "../components/AppTopbar";
import { TaskColumn } from "../components/TaskColumn";
import { TaskModal } from "../components/TaskModal";
import { SoftBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { MetricCard } from "../components/ui/MetricCard";
import { SurfaceCard } from "../components/ui/SurfaceCard";
import { useAuth } from "../context/AuthContext";
import type { Task, TaskFilters, Workspace, WorkspaceMember } from "../types";
import { groupTasksByStatus, summarizeTasks } from "../utils/taskUtils";
import { formatDate, formatRole, initials } from "../utils/format";
import { resetApplicationData } from "../utils/resetApp";

const defaultFilters: TaskFilters = {
  q: "",
  status: "",
  priority: "",
  assigneeId: "",
  overdue: false,
};

export function BoardPage() {
  const { workspaceId = "" } = useParams();
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const deferredSearch = useDeferredValue(filters.q);

  const currentWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === workspaceId) ?? null,
    [workspaces, workspaceId],
  );
  const totalCount = Math.max(tasks.length, 1);

  const grouped = useMemo(() => groupTasksByStatus(tasks), [tasks]);
  const stats = useMemo(() => summarizeTasks(tasks, user?.id), [tasks, user?.id]);
  const menuItems = useMemo(
    () => [
      {
        key: "workspaces",
        label: "Workspaces",
        icon: "workspace" as const,
        active: false,
        onClick: () => navigate("/workspaces"),
        meta: `${workspaces.length}`,
      },
      {
        key: "board",
        label: "Task Board",
        icon: "checkSquare" as const,
        active: true,
        onClick: () => navigate(`/workspace/${workspaceId}`),
      },
    ],
    [navigate, workspaceId, workspaces.length],
  );
  const projectItems = useMemo(
    () =>
      workspaces.map((workspace) => ({
        id: workspace.id,
        label: workspace.name,
        meta: formatRole(workspace.role),
        active: workspace.id === workspaceId,
        onClick: () => navigate(`/workspace/${workspace.id}`),
      })),
    [navigate, workspaceId, workspaces],
  );
  const activeFilters = useMemo(
    () =>
      [
        filters.q ? `Search: ${filters.q}` : "",
        filters.status ? `Status: ${filters.status.replace("_", " ")}` : "",
        filters.priority ? `Priority: ${filters.priority}` : "",
        filters.assigneeId ? "Assignee selected" : "",
        filters.overdue ? "Overdue only" : "",
      ].filter(Boolean),
    [filters],
  );

  const loadBoard = async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const search = new URLSearchParams();
      if (deferredSearch) search.set("q", deferredSearch);
      if (filters.status) search.set("status", filters.status);
      if (filters.priority) search.set("priority", filters.priority);
      if (filters.assigneeId) search.set("assigneeId", filters.assigneeId);
      if (filters.overdue) search.set("overdue", "true");

      const [workspaceData, memberData, taskData] = await Promise.all([
        api.get<Workspace[]>("/api/workspaces"),
        api.get<WorkspaceMember[]>(`/api/workspaces/${workspaceId}/members`),
        api.get<Task[]>(`/api/workspaces/${workspaceId}/tasks${search.toString() ? `?${search.toString()}` : ""}`),
      ]);

      setWorkspaces(workspaceData);
      setMembers(memberData);
      setTasks(taskData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBoard();
  }, [workspaceId, deferredSearch, filters.status, filters.priority, filters.assigneeId, filters.overdue]);

  useEffect(() => {
    if (loading || workspaces.length === 0 || currentWorkspace) {
      return;
    }

    navigate(`/workspace/${workspaces[0].id}`, { replace: true });
  }, [currentWorkspace, loading, navigate, workspaces]);

  const openCreateModal = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleDeleteTask = async (task: Task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) {
      return;
    }

    setDeletingTaskId(task.id);
    setError("");
    try {
      await api.delete(`/api/tasks/${task.id}`);
      if (selectedTask?.id === task.id) {
        setModalOpen(false);
        setSelectedTask(null);
      }
      await loadBoard();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete task");
    } finally {
      setDeletingTaskId(null);
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
          projects={projectItems}
          activeWorkspaceId={workspaceId}
          onWorkspaceSelect={(id) => navigate(`/workspace/${id}`)}
          onLogout={async () => {
            await logout();
            navigate("/login");
          }}
        />

        <main className="dashboard-stage">
          <AppTopbar
            title="Task Board"
            userName={user?.name}
            searchValue={filters.q}
            searchPlaceholder="Search tasks"
            onSearchChange={(value) => setFilters((current) => ({ ...current, q: value }))}
            onReset={handleReset}
            resetDisabled={resetting}
          />

          <div className="board-stage">
            <section className="board-main-column">
            <SurfaceCard className="hero-panel hero-panel-board">
              <div className="hero-copy">
                <div className="hero-meta-row">
                  <span className="section-eyebrow">
                    <Icon name="calendar" size={14} />
                    Task Management System
                  </span>
                  <span className="hero-timestamp">
                    Created {currentWorkspace ? formatDate(currentWorkspace.createdAt.slice(0, 10)) : "recently"}
                  </span>
                </div>
                <h1>{currentWorkspace?.name ?? "Task Board"}</h1>
                <p className="page-subtitle">
                  Create, view, update, and delete tasks from one simple board without changing the existing workflow.
                </p>
              </div>

              <div className="hero-action-cluster">
                <Button variant="ghost" iconLeft={<Icon name="back" size={16} />} onClick={() => navigate("/workspaces")}>
                  Workspaces
                </Button>
                <Button iconLeft={<Icon name="plus" size={16} />} onClick={openCreateModal}>
                  New Task
                </Button>
              </div>
            </SurfaceCard>

            {isDemoMode ? (
              <p className="info-banner">
                Demo mode is active on Netlify. Task changes and comments are stored in this browser so the preview stays
                fully usable without a separate backend.
              </p>
            ) : null}

            {error && <p className="error-banner">{error}</p>}

            <section className="stats-grid">
              <MetricCard
                title="Total Tasks"
                value={stats.total}
                leadingLabel={`${grouped.TODO.length} backlog`}
                trailingLabel={`${grouped.IN_PROGRESS.length} active`}
                progress={(grouped.TODO.length / totalCount) * 100}
                accent="blue"
                icon={<Icon name="dashboard" size={16} />}
              />
              <MetricCard
                title="Completed"
                value={stats.done}
                leadingLabel={`${stats.done} completed`}
                trailingLabel={`${stats.total - stats.done} pending`}
                progress={(stats.done / totalCount) * 100}
                accent="amber"
                icon={<Icon name="trend" size={16} />}
              />
              <MetricCard
                title="Assigned to Me"
                value={stats.mine}
                leadingLabel={`${stats.mine} assigned`}
                trailingLabel={`${members.length} members`}
                progress={(stats.mine / totalCount) * 100}
                accent="violet"
                icon={<Icon name="team" size={16} />}
              />
              <MetricCard
                title="Overdue"
                value={stats.overdue}
                leadingLabel={`${stats.overdue} overdue`}
                trailingLabel={`${grouped.DONE.length} done`}
                progress={(stats.overdue / totalCount) * 100}
                accent="rose"
                icon={<Icon name="calendar" size={16} />}
              />
            </section>

            <SurfaceCard className="filter-panel">
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">
                    <Icon name="filter" size={14} />
                    Filters
                  </span>
                  <h2>Find tasks quickly</h2>
                </div>
              </div>

              <div className="filter-grid">
                <label className="field-group field-group-inline">
                  <span className="field-label">Search</span>
                  <input
                    className="app-input"
                    placeholder="Search by title, description, or assignee"
                    value={filters.q}
                    onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
                  />
                </label>

                <label className="field-group field-group-inline">
                  <span className="field-label">Status</span>
                  <select
                    className="app-input"
                    value={filters.status}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, status: event.target.value as TaskFilters["status"] }))
                    }
                  >
                    <option value="">All status</option>
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </label>

                <label className="field-group field-group-inline">
                  <span className="field-label">Priority</span>
                  <select
                    className="app-input"
                    value={filters.priority}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, priority: event.target.value as TaskFilters["priority"] }))
                    }
                  >
                    <option value="">All priority</option>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </label>

                <label className="field-group field-group-inline">
                  <span className="field-label">Assignee</span>
                  <select
                    className="app-input"
                    value={filters.assigneeId}
                    onChange={(event) => setFilters((current) => ({ ...current, assigneeId: event.target.value }))}
                  >
                    <option value="">All assignees</option>
                    {members.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={filters.overdue}
                    onChange={(event) => setFilters((current) => ({ ...current, overdue: event.target.checked }))}
                  />
                  <span>Overdue only</span>
                </label>
              </div>

              {activeFilters.length > 0 ? (
                <div className="chip-row">
                  {activeFilters.map((filter) => (
                    <SoftBadge key={filter} tone="blue">
                      {filter}
                    </SoftBadge>
                  ))}
                </div>
              ) : null}

              <p className="panel-helper-text">
                Use a task card to edit it, or the trash icon on the card to delete it directly from the board.
              </p>
            </SurfaceCard>

            <section className="board-grid">
              {loading ? (
                <SurfaceCard className="loading-card">
                  <span>Loading board...</span>
                </SurfaceCard>
              ) : (
                <>
                  <TaskColumn
                    status="TODO"
                    tasks={grouped.TODO}
                    onSelect={openEditModal}
                    onDelete={handleDeleteTask}
                    deletingTaskId={deletingTaskId}
                  />
                  <TaskColumn
                    status="IN_PROGRESS"
                    tasks={grouped.IN_PROGRESS}
                    onSelect={openEditModal}
                    onDelete={handleDeleteTask}
                    deletingTaskId={deletingTaskId}
                  />
                  <TaskColumn
                    status="DONE"
                    tasks={grouped.DONE}
                    onSelect={openEditModal}
                    onDelete={handleDeleteTask}
                    deletingTaskId={deletingTaskId}
                  />
                </>
              )}
            </section>
            </section>

            <aside className="board-side-column">
              <SurfaceCard className="detail-panel">
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">
                    <Icon name="hash" size={14} />
                    Workspace details
                  </span>
                  <h2>{currentWorkspace?.name ?? "Task Board"}</h2>
                </div>
              </div>

              <div className="detail-stack">
                <div className="detail-row">
                  <span>Invite code</span>
                  <strong>{currentWorkspace?.inviteCode ?? "Loading..."}</strong>
                </div>
                <div className="detail-row">
                  <span>Role</span>
                  <strong>{currentWorkspace ? formatRole(currentWorkspace.role) : "Member"}</strong>
                </div>
                <div className="detail-row">
                  <span>Description</span>
                  <p>{currentWorkspace?.description ?? "No workspace description added yet."}</p>
                </div>
              </div>
              </SurfaceCard>

              <SurfaceCard className="detail-panel">
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">
                    <Icon name="team" size={14} />
                    Members
                  </span>
                  <h2>Workspace members</h2>
                </div>
                <span className="section-meta">{members.length}</span>
              </div>

              <div className="member-list">
                {members.map((member) => (
                  <div key={member.userId} className="member-card">
                    <span className="avatar-badge">{initials(member.name)}</span>
                    <div>
                      <strong>{member.name}</strong>
                      <span>{member.email}</span>
                    </div>
                    <span className="workspace-role-chip">{formatRole(member.role)}</span>
                  </div>
                ))}
              </div>
              </SurfaceCard>
            </aside>
          </div>
        </main>
      </div>

      <TaskModal
        open={modalOpen}
        workspaceId={workspaceId}
        task={selectedTask}
        members={members}
        onClose={() => setModalOpen(false)}
        onSaved={loadBoard}
      />
    </div>
  );
}
