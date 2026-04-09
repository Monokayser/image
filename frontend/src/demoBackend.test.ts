import { beforeEach, describe, expect, it } from "vitest";
import { handleDemoRequest } from "./api";
import type { Comment, Task, User, Workspace, WorkspaceMember } from "./types";

describe("demo backend", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("supports auth, workspace, task, comment, and reset flows", async () => {
    const user = await handleDemoRequest<User>("/api/auth/register", {
      method: "POST",
      body: {
        name: "Monowar Kayser",
        email: "monowarkayser010@gmail.com",
        password: "secret123",
      },
    });

    expect(user.email).toBe("monowarkayser010@gmail.com");

    const me = await handleDemoRequest<User>("/api/auth/me");
    expect(me.id).toBe(user.id);

    const workspace = await handleDemoRequest<Workspace>("/api/workspaces", {
      method: "POST",
      body: {
        name: "Demo Workspace",
        description: "Netlify demo workspace",
      },
    });

    expect(workspace.role).toBe("OWNER");

    const workspaces = await handleDemoRequest<Workspace[]>("/api/workspaces");
    expect(workspaces).toHaveLength(1);
    expect(workspaces[0]?.inviteCode).toHaveLength(8);

    const members = await handleDemoRequest<WorkspaceMember[]>(`/api/workspaces/${workspace.id}/members`);
    expect(members).toHaveLength(1);
    expect(members[0]?.email).toBe(user.email);

    const task = await handleDemoRequest<Task>(`/api/workspaces/${workspace.id}/tasks`, {
      method: "POST",
      body: {
        title: "Ship preview",
        description: "Verify the hosted demo flow",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2026-04-10",
        assigneeId: user.id,
      },
    });

    expect(task.assigneeName).toBe(user.name);

    const tasks = await handleDemoRequest<Task[]>(`/api/workspaces/${workspace.id}/tasks?status=TODO&assigneeId=${user.id}`);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.id).toBe(task.id);

    const updatedTask = await handleDemoRequest<Task>(`/api/tasks/${task.id}`, {
      method: "PUT",
      body: {
        title: "Ship preview",
        description: "Demo flow verified",
        status: "DONE",
        priority: "HIGH",
        dueDate: "2026-04-10",
        assigneeId: user.id,
      },
    });

    expect(updatedTask.status).toBe("DONE");

    const comment = await handleDemoRequest<Comment>(`/api/tasks/${task.id}/comments`, {
      method: "POST",
      body: {
        body: "Everything looks good.",
      },
    });

    expect(comment.authorId).toBe(user.id);

    const comments = await handleDemoRequest<Comment[]>(`/api/tasks/${task.id}/comments`);
    expect(comments).toHaveLength(1);

    await handleDemoRequest<void>("/api/system/reset", { method: "POST" });

    await expect(handleDemoRequest<User>("/api/auth/me")).rejects.toThrow("Please sign in to continue.");
  });
});
