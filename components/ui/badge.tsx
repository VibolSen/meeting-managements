import React from "react";

export type BadgeVariant =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed"
  | "available"
  | "conflict"
  | "active"
  | "maintenance"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withDot?: boolean;
  size?: "sm" | "default";
}

export function Badge({
  children,
  variant = "neutral",
  withDot = true,
  size = "default",
  className = "",
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    confirmed: {
      container: "bg-emerald-50 text-emerald-700 border-emerald-200/80 font-semibold",
      dot: "bg-emerald-500",
    },
    available: {
      container: "bg-emerald-50 text-emerald-700 border-emerald-200/80 font-semibold",
      dot: "bg-emerald-500 pulse-dot-available",
    },
    active: {
      container: "bg-emerald-50 text-emerald-700 border-emerald-200/80 font-semibold",
      dot: "bg-emerald-500",
    },
    pending: {
      container: "bg-amber-50 text-amber-700 border-amber-200/80 font-semibold",
      dot: "bg-amber-500",
    },
    maintenance: {
      container: "bg-amber-50 text-amber-700 border-amber-200/80 font-semibold",
      dot: "bg-amber-500",
    },
    conflict: {
      container: "bg-rose-50 text-rose-700 border-rose-200/80 font-semibold",
      dot: "bg-rose-500 pulse-dot-conflict",
    },
    cancelled: {
      container: "bg-rose-50 text-rose-700 border-rose-200/80 font-semibold",
      dot: "bg-rose-500",
    },
    completed: {
      container: "bg-indigo-50 text-indigo-700 border-indigo-200/80 font-semibold",
      dot: "bg-indigo-500",
    },
    neutral: {
      container: "bg-slate-100 text-slate-700 border-slate-200 font-medium",
      dot: "bg-slate-400",
    },
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  const sizeClass =
    size === "sm"
      ? "gap-1 px-2 py-0.2 text-[10px]"
      : "gap-1.5 px-2.5 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs ${sizeClass} ${style.container} ${className}`}
      {...props}
    >
      {withDot && (
        <span
          className={`${size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5"} rounded-full shrink-0 ${style.dot}`}
        />
      )}
      {children}
    </span>
  );
}
