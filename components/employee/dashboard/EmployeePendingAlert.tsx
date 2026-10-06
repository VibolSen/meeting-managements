"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

interface EmployeePendingAlertProps {
  pendingCount: number;
}

export function EmployeePendingAlert({ pendingCount }: EmployeePendingAlertProps) {
  if (pendingCount === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200/90 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">All RSVPs Up to Date</h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">You have no pending meeting invitations awaiting response.</p>
          </div>
        </div>
        <Link
          href="/employee/my-invitations"
          className="text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-200 flex items-center gap-1 group"
        >
          <span>View Past Invitations</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
          <AlertCircle className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
            Action Required: {pendingCount} Pending Meeting {pendingCount === 1 ? "Invitation" : "Invitations"}
          </h4>
          <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
            Your colleagues are waiting for your RSVP response to confirm conference attendance.
          </p>
        </div>
      </div>

      <Link
        href="/employee/my-invitations"
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs transition-all shrink-0"
      >
        <span>Respond Now</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

export default EmployeePendingAlert;
