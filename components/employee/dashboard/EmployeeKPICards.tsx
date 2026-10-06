"use client";

import React from "react";
import { Clock, Calendar, CheckCircle2, Users } from "lucide-react";

interface EmployeeKPICardsProps {
  pendingRsvpCount: number;
  todayMeetingsCount: number;
  totalConfirmedCount: number;
  colleaguesCount: number;
}

export function EmployeeKPICards({
  pendingRsvpCount,
  todayMeetingsCount,
  totalConfirmedCount,
  colleaguesCount,
}: EmployeeKPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Pending RSVPs */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4.5 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pending RSVPs
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {pendingRsvpCount}
          </span>
          {pendingRsvpCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Action Needed
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Invitations awaiting response</p>
      </div>

      {/* 2. Today's Sessions */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4.5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Today's Agenda
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
          {todayMeetingsCount}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Scheduled sessions today</p>
      </div>

      {/* 3. Confirmed Attendances */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4.5 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Confirmed Attendances
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
          {totalConfirmedCount}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Accepted invitations total</p>
      </div>

      {/* 4. Department Colleagues */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4.5 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Department Team
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
          {colleaguesCount}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Active team colleagues</p>
      </div>
    </div>
  );
}

export default EmployeeKPICards;
