import type { HTMLAttributes } from "react";

type Tone = "default" | "gradient" | "soft";

type Props = HTMLAttributes<HTMLDivElement> & {
  tone?: Tone;
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function SurfaceCard({ tone = "default", className, ...props }: Props) {
  return <div className={classNames("surface-card", `surface-card-${tone}`, className)} {...props} />;
}
