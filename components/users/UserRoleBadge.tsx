import React from "react";
import { ShieldCheck, Briefcase, UserCheck } from "lucide-react";
import { UserRole } from "@/lib/api";

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  switch (role) {
    case "ADMIN":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <ShieldCheck className="w-3 h-3" />
          ADMIN
        </span>
      );
    case "ORGANIZER":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
          <Briefcase className="w-3 h-3" />
          ORGANIZER
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <UserCheck className="w-3 h-3" />
          EMPLOYEE
        </span>
      );
  }
}
