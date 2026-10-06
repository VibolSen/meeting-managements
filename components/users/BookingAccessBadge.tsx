import React from "react";
import { CalendarCheck, Eye, Lock } from "lucide-react";
import { BookingAccessLevel } from "@/lib/api";

interface BookingAccessBadgeProps {
  access?: BookingAccessLevel;
  interactive?: boolean;
  onToggle?: () => void;
  title?: string;
  size?: "sm" | "md";
}

export function BookingAccessBadge({
  access = "FULL_ACCESS",
  interactive = false,
  onToggle,
  title,
  size = "sm",
}: BookingAccessBadgeProps) {
  const isViewOnly = access === "VIEW_ONLY";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-all select-none ${
        size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[11px]"
      } ${
        isViewOnly
          ? "bg-amber-50 text-amber-800 border border-amber-300/80 shadow-xs"
          : "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
      } ${
        interactive
          ? "cursor-pointer hover:shadow-sm hover:scale-105 active:scale-95"
          : ""
      }`}
      title={
        title ||
        (interactive
          ? isViewOnly
            ? "Click to grant Full Access (Confirmed Staff)"
            : "Click to set View Only (Probation Staff / Restricted)"
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
      <span className="relative flex h-2 w-2 shrink-0">
        {!isViewOnly && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-50" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isViewOnly ? "bg-amber-500" : "bg-indigo-600"
          }`}
        />
      </span>

      {isViewOnly ? (
        <span className="flex items-center gap-1 whitespace-nowrap">
          <Eye className="w-3 h-3 text-amber-600 shrink-0" />
          <span>View Only</span>
          <span className="hidden sm:inline text-[9px] font-bold text-amber-700 bg-amber-100/80 px-1 py-0.2 rounded ml-0.5">
            Probation
          </span>
        </span>
      ) : (
        <span className="flex items-center gap-1 whitespace-nowrap">
          <CalendarCheck className="w-3 h-3 text-indigo-600 shrink-0" />
          <span>Full Access</span>
        </span>
      )}
    </span>
  );
}

export default BookingAccessBadge;
