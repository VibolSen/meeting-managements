"use client";

import React from "react";
import { Calendar, Check, Clock, Timer } from "lucide-react";

interface EmployeeScheduleStatsProps {
  totalCount: number;
  acceptedCount: number;
  pendingCount: number;
  totalHours: number;
}

export function EmployeeScheduleStats({
  totalCount,
  acceptedCount,
  pendingCount,
  totalHours,
}: EmployeeScheduleStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Sessions
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight font-mono">
          {totalCount}
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">Assigned to you</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Confirmed RSVPs
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Check className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight font-mono">
          {acceptedCount}
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">Participation confirmed</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Awaiting RSVP
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight font-mono">
          {pendingCount}
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">Responses pending</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Estimated Duration
          </span>
          <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
            <Timer className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight font-mono">
          {totalHours.toFixed(1)} hrs
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">Total meeting duration</p>
      </div>
    </div>
  );
}

export default EmployeeScheduleStats;
