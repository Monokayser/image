import type { ReactNode } from "react";
import { priorityMeta, statusMeta } from "../../theme";
import type { Task } from "../../types";

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type BadgeProps = {
  tone?: string;
  children: ReactNode;
  className?: string;
};

export function SoftBadge({ tone = "blue", children, className }: BadgeProps) {
  return <span className={classNames("soft-badge", `soft-badge-${tone}`, className)}>{children}</span>;
}

export function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const meta = priorityMeta[priority];
  return <SoftBadge tone={meta.tone}>{meta.label}</SoftBadge>;
}

export function StatusBadge({ status }: { status: Task["status"] }) {
  const meta = statusMeta[status];
  return <SoftBadge tone={meta.tone}>{meta.label}</SoftBadge>;
}
