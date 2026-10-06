"use client";

import React from "react";
import { RefreshCw, Plus, Briefcase, LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MyMeetingViewMode } from "./types";

interface MyMeetingHeaderProps {
  loading: boolean;
  totalMeetings: number;
  pendingCount: number;
  viewMode: MyMeetingViewMode;
  onViewModeChange: (mode: MyMeetingViewMode) => void;
  onRefresh: () => void;
  onNewBooking: () => void;
}

export function MyMeetingHeader({
  loading,
  totalMeetings,
  pendingCount,
  viewMode,
  onViewModeChange,
  onRefresh,
  onNewBooking,
}: MyMeetingHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-slate-900/95 dark:via-[#111827] dark:to-slate-900/90 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              My Organized Meetings
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-transparent dark:border-indigo-800/60 text-xs font-bold font-mono">
              {totalMeetings}
            </span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-transparent dark:border-amber-800/60 text-xs font-bold font-mono animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage meetings where you are the lead organizer, track attendee RSVPs, and coordinate resources.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* View Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Table View"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onRefresh}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
          title="Refresh List"
        >
          Refresh
        </Button>

        <Button
          variant="primary"
          size="sm"
          type="button"
          onClick={onNewBooking}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Schedule Meeting
        </Button>
      </div>
    </div>
  );
}

export default MyMeetingHeader;
