import type { CSSProperties } from "react";

export type IconName =
  | "dashboard"
  | "checkSquare"
  | "message"
  | "settings"
  | "sparkles"
  | "plus"
  | "search"
  | "logout"
  | "back"
  | "calendar"
  | "user"
  | "team"
  | "workspace"
  | "arrowRight"
  | "hash"
  | "filter"
  | "comment"
  | "close"
  | "bell"
  | "mail"
  | "menu"
  | "trend"
  | "trash";

type Props = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

const paths: Record<IconName, string[]> = {
  dashboard: ["M4 5h7v7H4z", "M13 5h7v4h-7z", "M13 11h7v8h-7z", "M4 14h7v5H4z"],
  checkSquare: ["M9 11l2 2 4-4", "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"],
  message: ["M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z", "M8 9h8", "M8 13h5"],
  settings: [
    "M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7z",
    "M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.09V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.09-.4H2.9a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.6 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.09V2.9a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 8.6a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.09.4h.09a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z",
  ],
  sparkles: ["M12 3l1.9 4.85L19 10l-5.1 2.15L12 17l-1.9-4.85L5 10l5.1-2.15L12 3z", "M19 3l.8 2.2L22 6l-2.2.8L19 9l-.8-2.2L16 6l2.2-.8L19 3z", "M5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15z"],
  plus: ["M12 5v14", "M5 12h14"],
  search: ["m21 21-4.35-4.35", "M10.5 18a7.5 7.5 0 1 1 0-15a7.5 7.5 0 0 1 0 15z"],
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  back: ["M19 12H5", "m12 19-7-7 7-7"],
  calendar: ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
  user: ["M20 21a8 8 0 1 0-16 0", "M12 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8z"],
  team: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 7a4 4 0 1 0 0-8a4 4 0 0 0 0 8z", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  workspace: ["M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z", "M12 12 21 7.5", "M12 12v9"],
  arrowRight: ["M5 12h14", "m12 5 7 7-7 7"],
  hash: ["M5 9h14", "M4 15h14", "M10 3 8 21", "M16 3l-2 18"],
  filter: ["M4 5h16", "M7 12h10", "M10 19h4"],
  comment: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
  close: ["M18 6 6 18", "M6 6l12 12"],
  bell: ["M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5", "M10 21a2 2 0 0 0 4 0"],
  mail: ["M4 6h16v12H4z", "m4 7 8 6 8-6"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  trend: ["M4 16 9 11 13 15 20 8", "M15 8h5v5"],
  trash: ["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6", "M10 11v6", "M14 11v6"],
};

export function Icon({ name, size = 18, strokeWidth = 1.8, className }: Props) {
  const style = { "--icon-size": `${size}px` } as CSSProperties;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {paths[name].map((path, index) => (
        <path key={`${name}-${index}`} d={path} />
      ))}
    </svg>
  );
}
