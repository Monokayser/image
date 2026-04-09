import type { Comment, Task, TaskPayload, User, Workspace, WorkspaceMember } from "./types";

type Role = "OWNER" | "MEMBER";

type DemoUserRecord = User & {
  password: string;
};

type DemoWorkspaceRecord = Omit<Workspace, "role">;

type DemoMembershipRecord = {
  workspaceId: string;
  userId: string;
  role: Role;
};

type DemoState = {
  users: DemoUserRecord[];
  workspaces: DemoWorkspaceRecord[];
  memberships: DemoMembershipRecord[];
  tasks: Task[];
  comments: Comment[];
  sessionUserId: string | null;
};

type DemoRequestOptions = {
  method?: string;
  body?: unknown;
};

class DemoApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "DemoApiError";
    this.status = status;
  }
}

const STORAGE_KEY = "task-manager-demo-state-v1";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

export const isNetlifyHost =
  typeof window !== "undefined" && window.location.hostname.endsWith(".netlify.app");
export const isDemoMode = isNetlifyHost && !API_BASE_URL;

function createEmptyState(): DemoState {
  return {
    users: [],
    workspaces: [],
    memberships: [],
    tasks: [],
    comments: [],
    sessionUserId: null,
  };
}

function readState(): DemoState {
  if (typeof window === "undefined") {
    return createEmptyState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createEmptyState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DemoState>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      workspaces: Array.isArray(parsed.workspaces) ? parsed.workspaces : [],
      memberships: Array.isArray(parsed.memberships) ? parsed.memberships : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      comments: Array.isArray(parsed.comments) ? parsed.comments : [],
      sessionUserId: typeof parsed.sessionUserId === "string" ? parsed.sessionUserId : null,
    };
  } catch {
    return createEmptyState();
  }
}

function writeState(state: DemoState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function createInviteCode(existingCodes: Set<string>) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  while (true) {
    const code = Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    if (!existingCodes.has(code)) {
      return code;
    }
  }
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function asNonEmptyString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function requireUser(state: DemoState) {
  const user = state.users.find((candidate) => candidate.id === state.sessionUserId);
  if (!user) {
    throw new DemoApiError(401, "Please sign in to continue.");
  }

  return user;
}

function requireWorkspace(state: DemoState, workspaceId: string) {
  const workspace = state.workspaces.find((candidate) => candidate.id === workspaceId);
  if (!workspace) {
    throw new DemoApiError(404, "Workspace not found.");
  }

  return workspace;
}

function requireTask(state: DemoState, taskId: string) {
  const task = state.tasks.find((candidate) => candidate.id === taskId);
  if (!task) {
    throw new DemoApiError(404, "Task not found.");
  }

  return task;
}

function requireMembership(state: DemoState, userId: string, workspaceId: string) {
  const membership = state.memberships.find(
    (candidate) => candidate.userId === userId && candidate.workspaceId === workspaceId,
  );
  if (!membership) {
    throw new DemoApiError(403, "You do not have access to this workspace.");
  }

  return membership;
}

function toUser(user: DemoUserRecord): User {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function toWorkspaceView(state: DemoState, workspaceId: string, userId: string): Workspace {
  const workspace = requireWorkspace(state, workspaceId);
  const membership = requireMembership(state, userId, workspaceId);

  return {
    ...workspace,
    role: membership.role,
  };
}

function getWorkspaceMembers(state: DemoState, workspaceId: string): WorkspaceMember[] {
  return state.memberships
    .filter((membership) => membership.workspaceId === workspaceId)
    .map((membership) => {
      const user = state.users.find((candidate) => candidate.id === membership.userId);
      if (!user) {
        throw new DemoApiError(500, "Workspace member is missing.");
      }

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: membership.role,
      } satisfies WorkspaceMember;
    })
    .sort((left, right) => {
      if (left.role !== right.role) {
        return left.role === "OWNER" ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    });
}

function filterTasks(tasks: Task[], params: URLSearchParams) {
  const query = params.get("q")?.trim().toLowerCase() ?? "";
  const status = params.get("status");
  const priority = params.get("priority");
  const assigneeId = params.get("assigneeId");
  const overdue = params.get("overdue") === "true";
  const today = new Date().toISOString().slice(0, 10);

  return tasks
    .filter((task) => (status ? task.status === status : true))
    .filter((task) => (priority ? task.priority === priority : true))
    .filter((task) => (assigneeId ? task.assigneeId === assigneeId : true))
    .filter((task) => {
      if (!overdue) {
        return true;
      }

      return Boolean(task.dueDate && task.dueDate < today && task.status !== "DONE");
    })
    .filter((task) => {
      if (!query) {
        return true;
      }

      const haystack = [task.title, task.description ?? "", task.assigneeName ?? "", task.creatorName]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function requireTaskPayload(body: unknown): TaskPayload {
  if (!body || typeof body !== "object") {
    throw new DemoApiError(400, "Task details are required.");
  }

  const payload = body as Partial<TaskPayload>;
  const title = payload.title?.trim();
  if (!title) {
    throw new DemoApiError(400, "Task title is required.");
  }

  return {
    title,
    description: typeof payload.description === "string" ? payload.description.trim() : "",
    status: payload.status ?? "TODO",
    priority: payload.priority ?? "MEDIUM",
    dueDate: payload.dueDate ?? null,
    assigneeId: payload.assigneeId ?? null,
  };
}

export async function handleDemoRequest<T>(url: string, options: DemoRequestOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const parsedUrl = new URL(url, window.location.origin);
  const segments = parsedUrl.pathname.split("/").filter(Boolean);
  const state = readState();

  if (segments[0] !== "api") {
    throw new DemoApiError(404, "Unsupported demo endpoint.");
  }

  if (segments[1] === "auth" && segments[2] === "register" && method === "POST") {
    const body = (options.body ?? {}) as { name?: string; email?: string; password?: string };
    const name = asNonEmptyString(body.name, "");
    const email = normalizeEmail(body.email ?? "");
    const password = body.password?.trim() ?? "";

    if (!name) {
      throw new DemoApiError(400, "Name is required.");
    }
    if (!email) {
      throw new DemoApiError(400, "Email is required.");
    }
    if (password.length < 6) {
      throw new DemoApiError(400, "Password must be at least 6 characters.");
    }
    if (state.users.some((user) => user.email === email)) {
      throw new DemoApiError(400, "Email is already in use");
    }

    const user: DemoUserRecord = {
      id: createId("user"),
      name,
      email,
      password,
      createdAt: nowIso(),
    };

    state.users.push(user);
    state.sessionUserId = user.id;
    writeState(state);
    return toUser(user) as T;
  }

  if (segments[1] === "auth" && segments[2] === "login" && method === "POST") {
    const body = (options.body ?? {}) as { email?: string; password?: string };
    const email = normalizeEmail(body.email ?? "");
    const password = body.password?.trim() ?? "";
    const user = state.users.find((candidate) => candidate.email === email);

    if (!user || user.password !== password) {
      throw new DemoApiError(401, "Invalid email or password.");
    }

    state.sessionUserId = user.id;
    writeState(state);
    return toUser(user) as T;
  }

  if (segments[1] === "auth" && segments[2] === "me" && method === "GET") {
    return toUser(requireUser(state)) as T;
  }

  if (segments[1] === "auth" && segments[2] === "logout" && method === "POST") {
    state.sessionUserId = null;
    writeState(state);
    return undefined as T;
  }

  if (segments[1] === "system" && segments[2] === "reset" && method === "POST") {
    writeState(createEmptyState());
    return undefined as T;
  }

  if (segments[1] === "workspaces" && segments.length === 2 && method === "GET") {
    const user = requireUser(state);
    const workspaces = state.memberships
      .filter((membership) => membership.userId === user.id)
      .map((membership) => toWorkspaceView(state, membership.workspaceId, user.id))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

    return workspaces as T;
  }

  if (segments[1] === "workspaces" && segments.length === 2 && method === "POST") {
    const user = requireUser(state);
    const body = (options.body ?? {}) as { name?: string; description?: string };
    const name = asNonEmptyString(body.name, "");

    if (!name) {
      throw new DemoApiError(400, "Workspace name is required.");
    }

    const workspaceId = createId("workspace");
    const workspace: DemoWorkspaceRecord = {
      id: workspaceId,
      name,
      description: body.description?.trim() ? body.description.trim() : null,
      inviteCode: createInviteCode(new Set(state.workspaces.map((item) => item.inviteCode))),
      createdAt: nowIso(),
    };

    state.workspaces.push(workspace);
    state.memberships.push({
      workspaceId,
      userId: user.id,
      role: "OWNER",
    });
    writeState(state);

    return toWorkspaceView(state, workspaceId, user.id) as T;
  }

  if (segments[1] === "workspaces" && segments[2] === "join" && method === "POST") {
    const user = requireUser(state);
    const body = (options.body ?? {}) as { inviteCode?: string };
    const inviteCode = body.inviteCode?.trim().toUpperCase() ?? "";
    const workspace = state.workspaces.find((candidate) => candidate.inviteCode === inviteCode);

    if (!workspace) {
      throw new DemoApiError(404, "No workspace found for that invite code.");
    }

    const existingMembership = state.memberships.find(
      (candidate) => candidate.workspaceId === workspace.id && candidate.userId === user.id,
    );

    if (!existingMembership) {
      state.memberships.push({
        workspaceId: workspace.id,
        userId: user.id,
        role: "MEMBER",
      });
      writeState(state);
    }

    return toWorkspaceView(state, workspace.id, user.id) as T;
  }

  if (segments[1] === "workspaces" && segments[3] === "members" && method === "GET") {
    const user = requireUser(state);
    const workspaceId = segments[2] ?? "";
    requireMembership(state, user.id, workspaceId);
    return getWorkspaceMembers(state, workspaceId) as T;
  }

  if (segments[1] === "workspaces" && segments[3] === "tasks" && method === "GET") {
    const user = requireUser(state);
    const workspaceId = segments[2] ?? "";
    requireMembership(state, user.id, workspaceId);

    const tasks = filterTasks(
      state.tasks.filter((task) => task.workspaceId === workspaceId),
      parsedUrl.searchParams,
    );
    return tasks as T;
  }

  if (segments[1] === "workspaces" && segments[3] === "tasks" && method === "POST") {
    const user = requireUser(state);
    const workspaceId = segments[2] ?? "";
    requireMembership(state, user.id, workspaceId);

    const payload = requireTaskPayload(options.body);
    const assignee = payload.assigneeId
      ? getWorkspaceMembers(state, workspaceId).find((member) => member.userId === payload.assigneeId)
      : null;

    if (payload.assigneeId && !assignee) {
      throw new DemoApiError(400, "Assignee must be a member of the workspace.");
    }

    const timestamp = nowIso();
    const task: Task = {
      id: createId("task"),
      workspaceId,
      title: payload.title,
      description: payload.description || null,
      status: payload.status,
      priority: payload.priority,
      dueDate: payload.dueDate,
      assigneeId: payload.assigneeId,
      assigneeName: assignee?.name ?? null,
      creatorId: user.id,
      creatorName: user.name,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    state.tasks.push(task);
    writeState(state);
    return task as T;
  }

  if (segments[1] === "tasks" && segments.length === 3 && method === "PUT") {
    const user = requireUser(state);
    const taskId = segments[2] ?? "";
    const task = requireTask(state, taskId);
    requireMembership(state, user.id, task.workspaceId);

    const payload = requireTaskPayload(options.body);
    const assignee = payload.assigneeId
      ? getWorkspaceMembers(state, task.workspaceId).find((member) => member.userId === payload.assigneeId)
      : null;

    if (payload.assigneeId && !assignee) {
      throw new DemoApiError(400, "Assignee must be a member of the workspace.");
    }

    task.title = payload.title;
    task.description = payload.description || null;
    task.status = payload.status;
    task.priority = payload.priority;
    task.dueDate = payload.dueDate;
    task.assigneeId = payload.assigneeId;
    task.assigneeName = assignee?.name ?? null;
    task.updatedAt = nowIso();

    writeState(state);
    return task as T;
  }

  if (segments[1] === "tasks" && segments.length === 3 && method === "DELETE") {
    const user = requireUser(state);
    const taskId = segments[2] ?? "";
    const task = requireTask(state, taskId);
    requireMembership(state, user.id, task.workspaceId);

    state.tasks = state.tasks.filter((candidate) => candidate.id !== taskId);
    state.comments = state.comments.filter((candidate) => candidate.taskId !== taskId);
    writeState(state);
    return undefined as T;
  }

  if (segments[1] === "tasks" && segments[3] === "comments" && method === "GET") {
    const user = requireUser(state);
    const taskId = segments[2] ?? "";
    const task = requireTask(state, taskId);
    requireMembership(state, user.id, task.workspaceId);

    const comments = state.comments
      .filter((comment) => comment.taskId === taskId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));

    return comments as T;
  }

  if (segments[1] === "tasks" && segments[3] === "comments" && method === "POST") {
    const user = requireUser(state);
    const taskId = segments[2] ?? "";
    const task = requireTask(state, taskId);
    requireMembership(state, user.id, task.workspaceId);

    const body = (options.body ?? {}) as { body?: string };
    const commentBody = asNonEmptyString(body.body, "");
    if (!commentBody) {
      throw new DemoApiError(400, "Comment cannot be empty.");
    }

    const comment: Comment = {
      id: createId("comment"),
      taskId,
      authorId: user.id,
      authorName: user.name,
      body: commentBody,
      createdAt: nowIso(),
    };

    state.comments.push(comment);
    writeState(state);
    return comment as T;
  }

  throw new DemoApiError(404, "Unsupported demo endpoint.");
}
