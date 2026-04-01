import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { TaskColumn } from "../components/TaskColumn";
import { TaskModal } from "../components/TaskModal";
import { useAuth } from "../context/AuthContext";
import type { Task, TaskFilters, Workspace, WorkspaceMember } from "../types";
import { groupTasksByStatus, summarizeTasks } from "../utils/taskUtils";

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
  const { user, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const currentWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === workspaceId) ?? null,
    [workspaces, workspaceId],
  );

  const grouped = useMemo(() => groupTasksByStatus(tasks), [tasks]);
  const stats = useMemo(() => summarizeTasks(tasks, user?.id), [tasks, user?.id]);

  const loadBoard = async () => {
    setLoading(true);
    setError("");
    try {
      const search = new URLSearchParams();
      if (filters.q) search.set("q", filters.q);
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
  }, [workspaceId, filters.q, filters.status, filters.priority, filters.assigneeId, filters.overdue]);

  const openCreateModal = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Collaborative board</span>
          <h1>{currentWorkspace?.name ?? "Workspace board"}</h1>
          <p className="muted">
            Invite code: <code>{currentWorkspace?.inviteCode ?? "Loading..."}</code>
          </p>
        </div>
        <div className="button-row">
          <button className="ghost-button" onClick={() => navigate("/workspaces")}>
            Back to workspaces
          </button>
          <button className="ghost-button" onClick={async () => { await logout(); navigate("/login"); }}>
            Sign out
          </button>
        </div>
      </header>

      {error && <p className="error-banner">{error}</p>}

      <section className="stats-grid">
        <div className="stat-card"><span>Total tasks</span><strong>{stats.total}</strong></div>
        <div className="stat-card"><span>Overdue</span><strong>{stats.overdue}</strong></div>
        <div className="stat-card"><span>Assigned to me</span><strong>{stats.mine}</strong></div>
        <div className="stat-card"><span>Done</span><strong>{stats.done}</strong></div>
      </section>

      <section className="panel">
        <div className="filter-bar">
          <input
            placeholder="Search by title, description, or assignee"
            value={filters.q}
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
          />

          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as TaskFilters["status"] }))}
          >
            <option value="">All status</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>

          <select
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

          <select
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

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={filters.overdue}
              onChange={(event) => setFilters((current) => ({ ...current, overdue: event.target.checked }))}
            />
            Overdue only
          </label>

          <button className="primary-button" onClick={openCreateModal}>
            Create task
          </button>
        </div>
      </section>

      <section className="board-grid">
        {loading ? (
          <div className="panel">Loading board...</div>
        ) : (
          <>
            <TaskColumn title="To Do" tasks={grouped.TODO} onSelect={openEditModal} />
            <TaskColumn title="In Progress" tasks={grouped.IN_PROGRESS} onSelect={openEditModal} />
            <TaskColumn title="Done" tasks={grouped.DONE} onSelect={openEditModal} />
          </>
        )}
      </section>

      <section className="panel">
        <h2>Workspace members</h2>
        <div className="members-grid">
          {members.map((member) => (
            <div key={member.userId} className="member-card">
              <strong>{member.name}</strong>
              <span>{member.email}</span>
              <span>{member.role}</span>
            </div>
          ))}
        </div>
      </section>

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
