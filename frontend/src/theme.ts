import type { Task } from "./types";

export const statusMeta: Record<
  Task["status"],
  { label: string; caption: string; tone: string }
> = {
  TODO: {
    label: "To-do",
    caption: "Ideas, drafts, and upcoming work",
    tone: "blue",
  },
  IN_PROGRESS: {
    label: "In Progress",
    caption: "Active work currently being shaped",
    tone: "amber",
  },
  DONE: {
    label: "Done",
    caption: "Completed tasks ready for review",
    tone: "violet",
  },
};

export const priorityMeta: Record<
  Task["priority"],
  { label: string; tone: string }
> = {
  LOW: {
    label: "Low",
    tone: "violet",
  },
  MEDIUM: {
    label: "Medium",
    tone: "amber",
  },
  HIGH: {
    label: "High",
    tone: "rose",
  },
};

export const appMenu = [
  { key: "workspaces", label: "Workspaces", icon: "workspace" as const },
  { key: "tasks", label: "Task Board", icon: "checkSquare" as const },
];
