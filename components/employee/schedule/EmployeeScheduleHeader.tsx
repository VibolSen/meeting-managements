"use client";

import React from "react";
import { Search, Calendar, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export type ScheduleTimeframe = "all" | "today" | "week" | "past";
export type ScheduleRsvpFilter = "all" | "ACCEPTED" | "PENDING" | "DECLINED";

interface EmployeeScheduleHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  timeframe: ScheduleTimeframe;
  onTimeframeChange: (timeframe: ScheduleTimeframe) => void;
  rsvpFilter: ScheduleRsvpFilter;
  onRsvpFilterChange: (filter: ScheduleRsvpFilter) => void;
  totalCount: number;
}

export function EmployeeScheduleHeader({
  searchQuery,
  onSearchChange,
  timeframe,
  onTimeframeChange,
  rsvpFilter,
  onRsvpFilterChange,
  totalCount,
}: EmployeeScheduleHeaderProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      {/* Top Title & Total Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">My Schedule & Agenda</h1>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                {totalCount} Sessions
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Meetings and conferences you are scheduled or invited to attend
            </p>
          </div>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 self-start sm:self-center">
          <button
            onClick={() => onTimeframeChange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              timeframe === "all"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Upcoming
          </button>
          <button
            onClick={() => onTimeframeChange("today")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              timeframe === "today"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => onTimeframeChange("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              timeframe === "week"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => onTimeframeChange("past")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              timeframe === "past"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Search and RSVP Status Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by meeting title, room, organizer..."
            className="pl-9 text-xs h-9"
          />
        </div>

        {/* RSVP Status Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            RSVP:
          </span>

          <button
            onClick={() => onRsvpFilterChange("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              rsvpFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => onRsvpFilterChange("ACCEPTED")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              rsvpFilter === "ACCEPTED"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => onRsvpFilterChange("PENDING")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              rsvpFilter === "PENDING"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            Pending RSVP
          </button>
          <button
            onClick={() => onRsvpFilterChange("DECLINED")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              rsvpFilter === "DECLINED"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            Declined
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeScheduleHeader;
