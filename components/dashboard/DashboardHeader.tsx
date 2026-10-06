"use client";

import React from "react";
import { Sparkles, RefreshCw, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardHeaderProps } from "./types";

export function DashboardHeader({
  currentUser,
  loading,
  onRefresh,
  onScheduleMeeting,
}: DashboardHeaderProps) {
  // Format current date nicely
  const currentDateStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-slate-900/95 dark:via-[#111827] dark:to-slate-900/90 p-4 sm:p-5 shadow-xs">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>Real-Time Operational Overview</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              •
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {currentDateStr}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {currentUser?.name || "Team Member"}
            </h1>
            {currentUser?.role && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                {currentUser.role}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            Monitor live room utilization, coordinate equipment logistics, and manage conflict-free meeting reservations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={loading}
            className="h-8.5 text-xs px-3 bg-white"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onScheduleMeeting}
            className="h-8.5 text-xs px-3.5 shadow-indigo-600/20"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Schedule Meeting
          </Button>
        </div>
      </div>
    </div>
  );
}
