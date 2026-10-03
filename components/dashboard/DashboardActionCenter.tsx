"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardActionCenterProps } from "./types";

export function DashboardActionCenter({
  summary,
  loading,
  onReviewApprovals,
}: DashboardActionCenterProps) {
  const pendingCount = summary?.pendingMeetings ?? 0;
  const totalRooms = summary?.totalRooms ?? 0;
  const activeRooms = summary?.activeRooms ?? 0;
  const roomRate = totalRooms > 0 ? Math.round((activeRooms / totalRooms) * 100) : 0;

  const totalStaff = summary?.totalStaff ?? 0;
  const availableStaff = summary?.availableStaff ?? 0;
  const staffRate = totalStaff > 0 ? Math.round((availableStaff / totalStaff) * 100) : 0;

  return (
    <div className="space-y-3.5">
      <h3 className="text-base font-bold text-slate-900 tracking-tight">
        Action Center
      </h3>

      {/* 1. Pending Approvals Banner */}
      {pendingCount > 0 ? (
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/80 space-y-2.5 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-amber-950">
                {pendingCount} Large Meeting{pendingCount > 1 ? "s" : ""} Pending Approval
              </h4>
              <p className="text-[11px] text-amber-800 leading-snug">
                Bookings for high-capacity conference rooms require administrative review.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="w-full h-8 text-xs font-semibold bg-amber-600 hover:bg-amber-700 border-amber-600 shadow-amber-600/20"
            onClick={onReviewApprovals}
          >
            Review & Approve Now
          </Button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Approvals Up-To-Date</span>
          </div>
          <p className="text-[11px] text-slate-500">
            All meeting requests have been processed. No boardroom approval pending.
          </p>
        </div>
      )}

      {/* 2. Operational Resource Health Gauges */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span>Resource Health</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Live
          </span>
        </div>

        {/* Room Readiness */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Room Operational Readiness</span>
            <span className="font-bold text-slate-900">
              {loading ? "..." : `${roomRate}%`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${roomRate}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>{activeRooms} Active</span>
            <span>{totalRooms} Total Rooms</span>
          </div>
        </div>

        {/* Staff Availability */}
        <div className="space-y-1 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Staff Duty Availability</span>
            <span className="font-bold text-slate-900">
              {loading ? "..." : `${staffRate}%`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${staffRate}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>{availableStaff} On Duty</span>
            <span>{totalStaff} Total Staff</span>
          </div>
        </div>
      </div>
    </div>
  );
}
