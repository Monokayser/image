import type { Task } from "../types";

type Props = {
  title: string;
  tasks: Task[];
  onSelect: (task: Task) => void;
};

export function TaskColumn({ title, tasks, onSelect }: Props) {
  return (
    <section className="column">
      <div className="column-header">
        <h3>{title}</h3>
        <span>{tasks.length}</span>
      </div>

      <div className="column-body">
        {tasks.length === 0 ? (
          <div className="empty-card">No tasks in this column.</div>
        ) : (
          tasks.map((task) => (
            <button key={task.id} className="task-card" onClick={() => onSelect(task)}>
              <div className="task-card-top">
                <strong>{task.title}</strong>
                <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
              </div>
              <p>{task.description ?? "No description"}</p>
              <div className="task-card-footer">
                <span>{task.assigneeName ?? "Unassigned"}</span>
                <span>{task.dueDate ?? "No due date"}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
