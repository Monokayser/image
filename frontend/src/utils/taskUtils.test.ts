import { describe, expect, it } from "vitest";
import { groupTasksByStatus, summarizeTasks } from "./taskUtils";
import type { Task } from "../types";

const tasks: Task[] = [
  {
    id: "1",
    workspaceId: "w1",
    title: "Task A",
    description: null,
    status: "TODO",
    priority: "HIGH",
    dueDate: "2024-01-01",
    assigneeId: "u1",
    assigneeName: "User One",
    creatorId: "u1",
    creatorName: "User One",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "2",
    workspaceId: "w1",
    title: "Task B",
    description: null,
    status: "DONE",
    priority: "LOW",
    dueDate: null,
    assigneeId: "u2",
    assigneeName: "User Two",
    creatorId: "u1",
    creatorName: "User One",
    createdAt: "",
    updatedAt: "",
  },
];

describe("taskUtils", () => {
  it("groups tasks by status", () => {
    const grouped = groupTasksByStatus(tasks);
    expect(grouped.TODO).toHaveLength(1);
    expect(grouped.DONE).toHaveLength(1);
  });

  it("summarizes tasks", () => {
    const summary = summarizeTasks(tasks, "u1");
    expect(summary.total).toBe(2);
    expect(summary.mine).toBe(1);
    expect(summary.done).toBe(1);
  });
});
