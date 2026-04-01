import { useEffect, useState } from "react";
import { api } from "../api";
import type { Comment, Task, TaskPayload, WorkspaceMember } from "../types";

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

  useEffect(() => {
    if (!open) {
      return;
    }

    if (task) {
      setPayload({
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assigneeId: task.assigneeId,
      });

      void api
        .get<Comment[]>(`/api/tasks/${task.id}/comments`)
        .then(setComments)
        .catch((loadError: Error) => setError(loadError.message));
    } else {
      setPayload(emptyPayload);
      setComments([]);
    }

    setCommentBody("");
    setError("");
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

    try {
      await api.delete(`/api/tasks/${task.id}`);
      await onSaved();
      onClose();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete task");
    }
  };

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!task) {
      return;
    }

    try {
      const created = await api.post<Comment>(`/api/tasks/${task.id}/comments`, { body: commentBody });
      setComments((current) => [...current, created]);
      setCommentBody("");
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : "Unable to add comment");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">{task ? "Edit task" : "Create task"}</span>
            <h2>{task ? task.title : "New task"}</h2>
          </div>
          <button className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        {error && <p className="error-banner">{error}</p>}

        <div className="modal-grid">
          <form className="stack" onSubmit={handleSave}>
            <label>
              Title
              <input
                value={payload.title}
                onChange={(event) => setPayload((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </label>

            <label>
              Description
              <textarea
                rows={5}
                value={payload.description}
                onChange={(event) => setPayload((current) => ({ ...current, description: event.target.value }))}
              />
            </label>

            <div className="field-row">
              <label>
                Status
                <select
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

              <label>
                Priority
                <select
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

            <div className="field-row">
              <label>
                Due date
                <input
                  type="date"
                  value={payload.dueDate ?? ""}
                  onChange={(event) =>
                    setPayload((current) => ({ ...current, dueDate: event.target.value || null }))
                  }
                />
              </label>

              <label>
                Assignee
                <select
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

            <div className="button-row">
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Saving..." : task ? "Update task" : "Create task"}
              </button>
              {task && (
                <button type="button" className="danger-button" onClick={handleDelete}>
                  Delete task
                </button>
              )}
            </div>
          </form>

          <div className="comments-panel">
            <h3>Comments</h3>
            {!task ? (
              <p className="muted">Save the task first to start the discussion thread.</p>
            ) : (
              <>
                <div className="comments-list">
                  {comments.length === 0 ? (
                    <p className="muted">No comments yet.</p>
                  ) : (
                    comments.map((comment) => (
                      <article key={comment.id} className="comment-card">
                        <strong>{comment.authorName}</strong>
                        <p>{comment.body}</p>
                        <span>{new Date(comment.createdAt).toLocaleString()}</span>
                      </article>
                    ))
                  )}
                </div>

                <form className="stack" onSubmit={handleCommentSubmit}>
                  <label>
                    Add comment
                    <textarea
                      rows={4}
                      value={commentBody}
                      onChange={(event) => setCommentBody(event.target.value)}
                    />
                  </label>
                  <button type="submit" className="secondary-button">
                    Post comment
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
