"use client";

import React from "react";
import { UserCheck, CheckCircle2, Clock, Moon } from "lucide-react";
import { StaffStats } from "./types";

interface StaffStatsCardsProps {
  stats: StaffStats;
}

export function StaffStatsCards({ stats }: StaffStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Staff */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-slate-300 transition-all">
        <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 shrink-0">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Roster
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {stats.total}
            </span>
            <span className="text-xs text-slate-400">personnel</span>
          </div>
        </div>
      </div>

      {/* Available Staff */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-emerald-200 transition-all">
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Available
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {stats.available}
            </span>
            <span className="text-xs text-emerald-600/70">on-duty</span>
          </div>
        </div>
      </div>

      {/* Currently Assigned */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-amber-200 transition-all">
        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Assigned
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold font-mono text-amber-600">
              {stats.assigned}
            </span>
            <span className="text-xs text-amber-600/70">in meetings</span>
          </div>
        </div>
      </div>

      {/* Off Duty */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-slate-300 transition-all">
        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500 shrink-0">
          <Moon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Off Duty
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold font-mono text-slate-600">
              {stats.offDuty}
            </span>
            <span className="text-xs text-slate-400">inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
}
