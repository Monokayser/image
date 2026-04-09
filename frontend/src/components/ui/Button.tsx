import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "icon";
type ButtonSize = "md" | "sm";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      className={classNames("ui-button", `ui-button-${variant}`, `ui-button-${size}`, className)}
      {...props}
    >
      {iconLeft ? <span className="ui-button-slot">{iconLeft}</span> : null}
      {children ? <span>{children}</span> : null}
      {iconRight ? <span className="ui-button-slot">{iconRight}</span> : null}
    </button>
  );
}
