"use client";

import React from "react";
import { RefreshCw, Plus, CalendarCheck } from "lucide-react";
import { RiFileExcel2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";

interface MeetingHeaderProps {
  loading: boolean;
  totalMeetings: number;
  pendingCount: number;
  onRefresh: () => void;
  onNewBooking: () => void;
  onExportExcel: () => void;
}

export function MeetingHeader({
  loading,
  totalMeetings,
  pendingCount,
  onRefresh,
  onNewBooking,
  onExportExcel,
}: MeetingHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
          <CalendarCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Meetings & Approvals
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold font-mono">
              {totalMeetings}
            </span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track schedules, manage boardroom approvals, inspect logistics, and submit attendance RSVPs.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onRefresh}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
          title="Refresh Meeting List"
        >
          Refresh
        </Button>

        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onExportExcel}
          leftIcon={<RiFileExcel2Line className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          className="text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/90 border-emerald-200"
          title="Export Schedule to Excel"
        >
          Export
        </Button>

        <Button
          variant="primary"
          size="sm"
          type="button"
          onClick={onNewBooking}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          New Booking
        </Button>
      </div>
    </div>
  );
}
