import type { Task } from "../types";

export const TASK_COLUMNS: Array<Task["status"]> = ["TODO", "IN_PROGRESS", "DONE"];

export function groupTasksByStatus(tasks: Task[]) {
  return TASK_COLUMNS.reduce<Record<Task["status"], Task[]>>(
    (acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status);
      return acc;
    },
    { TODO: [], IN_PROGRESS: [], DONE: [] },
  );
}

export function summarizeTasks(tasks: Task[], currentUserId?: string | null) {
  const today = new Date().toISOString().slice(0, 10);

  return {
    total: tasks.length,
    overdue: tasks.filter((task) => task.dueDate && task.dueDate < today && task.status !== "DONE").length,
    mine: tasks.filter((task) => currentUserId && task.assigneeId === currentUserId).length,
    done: tasks.filter((task) => task.status === "DONE").length,
  };
}
