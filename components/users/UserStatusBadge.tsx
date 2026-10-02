import React from "react";
import { CheckCircle2, AlertOctagon } from "lucide-react";
import { UserStatus } from "@/lib/api";

interface UserStatusBadgeProps {
  status?: UserStatus;
  interactive?: boolean;
  onToggle?: () => void;
  title?: string;
}

export function UserStatusBadge({
  status = "ACTIVE",
  interactive = false,
  onToggle,
  title,
}: UserStatusBadgeProps) {
  const isSuspended = status === "SUSPENDED";

  const badgeContent = (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
        isSuspended
          ? "bg-rose-50 text-rose-700 border border-rose-200"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
      } ${
        interactive
          ? "cursor-pointer hover:shadow-sm hover:scale-105 active:scale-95 select-none"
          : ""
      }`}
      title={
        title ||
        (interactive
          ? isSuspended
            ? "Click to activate user account"
            : "Click to suspend user account"
          : undefined)
      }
      onClick={interactive && onToggle ? onToggle : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => {
        if (interactive && onToggle && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <span className="relative flex h-2 w-2">
        {!isSuspended && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isSuspended ? "bg-rose-500" : "bg-emerald-500"
          }`}
        />
      </span>
      {isSuspended ? (
        <span className="flex items-center gap-1">
          <AlertOctagon className="w-3 h-3 text-rose-600" />
          Suspended
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Active
        </span>
      )}
    </span>
  );

  return badgeContent;
}
