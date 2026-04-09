import { useEffect, useState } from "react";
import { api } from "../api";
import { formatDateTime } from "../utils/format";
import type { Comment, Task, TaskPayload, WorkspaceMember } from "../types";
import { PriorityBadge, StatusBadge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Icon } from "./ui/Icon";
import { SurfaceCard } from "./ui/SurfaceCard";

type Props = {
  open: boolean;
  workspaceId: string;
  task: Task | null;
  members: WorkspaceMember[];
  onClose: () => void;
  onSaved: () => Promise<void>;
};

const emptyPayload: TaskPayload = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: null,
  assigneeId: null,
};

export function TaskModal({ open, workspaceId, task, members, onClose, onSaved }: Props) {
  const [payload, setPayload] = useState<TaskPayload>(emptyPayload);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSaving, setCommentSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");
    setCommentBody("");

    if (task) {
      setPayload({
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assigneeId: task.assigneeId,
      });

      setCommentsLoading(true);
      void api
        .get<Comment[]>(`/api/tasks/${task.id}/comments`)
        .then(setComments)
        .catch((loadError: Error) => setError(loadError.message))
        .finally(() => setCommentsLoading(false));
    } else {
      setPayload(emptyPayload);
      setComments([]);
      setCommentsLoading(false);
    }
  }, [open, task]);

  if (!open) {
    return null;
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (task) {
        await api.put(`/api/tasks/${task.id}`, payload);
      } else {
        await api.post(`/api/workspaces/${workspaceId}/tasks`, payload);
      }
      await onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save task");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !window.confirm("Delete this task?")) {
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.delete(`/api/tasks/${task.id}`);
      await onSaved();
      onClose();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete task");
    } finally {
      setSaving(false);
    }
  };

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!task || !commentBody.trim()) {
      return;
    }

    setCommentSaving(true);
    setError("");
    try {
      const created = await api.post<Comment>(`/api/tasks/${task.id}/comments`, { body: commentBody.trim() });
      setComments((current) => [...current, created]);
      setCommentBody("");
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : "Unable to add comment");
    } finally {
      setCommentSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-shell">
        <div className="modal-header">
          <div>
            <span className="section-eyebrow">
              <Icon name="sparkles" size={14} />
              {task ? "Edit task" : "Create task"}
            </span>
            <h2>{task ? task.title : "New task"}</h2>
            <p className="page-subtitle">
              Update details, keep collaborators aligned, and use the delete button below when a task is no longer needed.
            </p>
          </div>
          <Button variant="icon" aria-label="Close dialog" onClick={onClose}>
            <Icon name="close" size={18} />
          </Button>
        </div>

        {error && <p className="error-banner">{error}</p>}

        <div className="modal-grid">
          <SurfaceCard className="modal-form-card" tone="soft">
            <form className="form-stack" onSubmit={handleSave}>
              <div className="modal-chip-row">
                <StatusBadge status={payload.status} />
                <PriorityBadge priority={payload.priority} />
              </div>

              <label className="field-group">
                <span className="field-label">Title</span>
                <input
                  className="app-input"
                  value={payload.title}
                  onChange={(event) => setPayload((current) => ({ ...current, title: event.target.value }))}
                  maxLength={180}
                  required
                />
              </label>

              <label className="field-group">
                <span className="field-label">Description</span>
                <textarea
                  className="app-input app-textarea"
                  rows={5}
                  value={payload.description}
                  onChange={(event) => setPayload((current) => ({ ...current, description: event.target.value }))}
                  maxLength={5000}
                />
              </label>

              <div className="form-grid-two">
                <label className="field-group">
                  <span className="field-label">Status</span>
                  <select
                    className="app-input"
                    value={payload.status}
                    onChange={(event) =>
                      setPayload((current) => ({ ...current, status: event.target.value as Task["status"] }))
                    }
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>
                </label>

                <label className="field-group">
                  <span className="field-label">Priority</span>
                  <select
                    className="app-input"
                    value={payload.priority}
                    onChange={(event) =>
                      setPayload((current) => ({ ...current, priority: event.target.value as Task["priority"] }))
                    }
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </label>
              </div>

              <div className="form-grid-two">
                <label className="field-group">
                  <span className="field-label">Due date</span>
                  <input
                    className="app-input"
                    type="date"
                    value={payload.dueDate ?? ""}
                    onChange={(event) =>
                      setPayload((current) => ({ ...current, dueDate: event.target.value || null }))
                    }
                  />
                </label>

                <label className="field-group">
                  <span className="field-label">Assignee</span>
                  <select
                    className="app-input"
                    value={payload.assigneeId ?? ""}
                    onChange={(event) =>
                      setPayload((current) => ({ ...current, assigneeId: event.target.value || null }))
                    }
                  >
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="modal-actions">
                <Button type="submit" disabled={saving} iconLeft={<Icon name="plus" size={16} />}>
                  {saving ? "Saving..." : task ? "Update task" : "Create task"}
                </Button>
                {task ? (
                  <Button
                    type="button"
                    variant="danger"
                    disabled={saving}
                    onClick={handleDelete}
                    iconLeft={<Icon name="trash" size={15} />}
                  >
                    Delete task
                  </Button>
                ) : null}
              </div>
            </form>
          </SurfaceCard>

          <SurfaceCard className="modal-comments-card">
            <div className="modal-comments-header">
              <div>
                <span className="section-eyebrow">
                  <Icon name="comment" size={14} />
                  Discussion
                </span>
                <h3>Comments</h3>
              </div>
            </div>

            {!task ? (
              <div className="empty-state">
                <Icon name="comment" size={18} />
                <span>Save the task first to start the discussion thread.</span>
              </div>
            ) : (
              <>
              <div className="comments-list">
                  {commentsLoading ? (
                    <div className="empty-state">
                      <Icon name="comment" size={18} />
                      <span>Loading comments...</span>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="empty-state">
                      <Icon name="sparkles" size={18} />
                      <span>No comments yet.</span>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <article key={comment.id} className="comment-card">
                        <div className="comment-card-header">
                          <strong>{comment.authorName}</strong>
                          <span>{formatDateTime(comment.createdAt)}</span>
                        </div>
                        <p>{comment.body}</p>
                      </article>
                    ))
                  )}
                </div>

                <form className="form-stack" onSubmit={handleCommentSubmit}>
                  <label className="field-group">
                    <span className="field-label">Add comment</span>
                    <textarea
                      className="app-input app-textarea"
                      rows={4}
                      value={commentBody}
                      onChange={(event) => setCommentBody(event.target.value)}
                      maxLength={3000}
                    />
                  </label>
                  <Button type="submit" variant="secondary" disabled={commentSaving || !commentBody.trim()}>
                    {commentSaving ? "Posting..." : "Post comment"}
                  </Button>
                </form>
              </>
            )}
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
