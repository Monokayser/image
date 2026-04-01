export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type Workspace = {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  role: "OWNER" | "MEMBER";
  createdAt: string;
};

export type WorkspaceMember = {
  userId: string;
  name: string;
  email: string;
  role: "OWNER" | "MEMBER";
};

export type Task = {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type TaskPayload = {
  title: string;
  description: string;
  status: Task["status"];
  priority: Task["priority"];
  dueDate: string | null;
  assigneeId: string | null;
};

export type TaskFilters = {
  q: string;
  status: "" | Task["status"];
  priority: "" | Task["priority"];
  assigneeId: string;
  overdue: boolean;
};
