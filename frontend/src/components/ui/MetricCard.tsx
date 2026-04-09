import type { ReactNode } from "react";

type Props = {
  title: string;
  value: number;
  leadingLabel: string;
  trailingLabel: string;
  progress: number;
  accent?: "blue" | "amber" | "violet" | "rose";
  icon?: ReactNode;
};

export function MetricCard({
  title,
  value,
  leadingLabel,
  trailingLabel,
  progress,
  accent = "blue",
  icon,
}: Props) {
  return (
    <div className={`metric-card metric-card-${accent}`}>
      <div className="metric-card-header">
        <span className="metric-card-title">{title}</span>
        {icon ? <span className="metric-card-icon">{icon}</span> : null}
      </div>
      <strong className="metric-card-value">{value}</strong>
      <div className="metric-progress">
        <span className="metric-progress-track">
          <span className="metric-progress-fill" style={{ width: `${Math.max(8, Math.min(progress, 100))}%` }} />
        </span>
      </div>
      <div className="metric-card-footer">
        <span className="metric-card-footer-item">{leadingLabel}</span>
        <span className="metric-card-footer-item">{trailingLabel}</span>
      </div>
    </div>
  );
}
