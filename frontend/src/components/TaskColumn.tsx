import { statusMeta } from "../theme";
import type { Task } from "../types";
import { formatDate } from "../utils/format";
import { PriorityBadge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Icon } from "./ui/Icon";
import { SurfaceCard } from "./ui/SurfaceCard";

type Props = {
  status: Task["status"];
  tasks: Task[];
  onSelect: (task: Task) => void;
  onDelete: (task: Task) => void;
  deletingTaskId?: string | null;
};

export function TaskColumn({ status, tasks, onSelect, onDelete, deletingTaskId = null }: Props) {
  const meta = statusMeta[status];

  return (
    <SurfaceCard className="task-column">
      <div className="task-column-header">
        <div>
          <div className="section-eyebrow">
            <span className={`status-dot status-dot-${meta.tone}`} />
            <span>{meta.label}</span>
          </div>
          <h3>{meta.caption}</h3>
        </div>
        <span className={`column-counter column-counter-${meta.tone}`}>{tasks.length}</span>
      </div>

      <div className="task-column-body">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <Icon name="sparkles" size={18} />
            <span>No tasks in this column yet.</span>
          </div>
        ) : (
          tasks.map((task) => (
            <article key={task.id} className="task-card">
              <div className="task-card-header">
                <div className="task-card-heading">
                  <strong>{task.title}</strong>
                  <span>{task.assigneeName ?? "Unassigned"}</span>
                </div>
                <div className="task-card-actions">
                  <PriorityBadge priority={task.priority} />
                  <Button
                    type="button"
                    variant="icon"
                    size="sm"
                    className="task-card-delete"
                    aria-label={`Delete ${task.title}`}
                    disabled={deletingTaskId === task.id}
                    onClick={() => onDelete(task)}
                  >
                    <Icon name="trash" size={15} />
                  </Button>
                </div>
              </div>

              <button type="button" className="task-card-main" onClick={() => onSelect(task)}>
                <p className="task-card-description">{task.description ?? "No description provided yet."}</p>

                <div className="task-card-footer">
                  <span className="task-card-meta">
                    <Icon name="calendar" size={14} />
                    {formatDate(task.dueDate)}
                  </span>
                  <span className="task-card-meta">
                    <Icon name="comment" size={14} />
                    Edit task
                  </span>
                </div>
              </button>
            </article>
          ))
        )}
      </div>
    </SurfaceCard>
  );
}
