"use client";

import React from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  CalendarCheck2,
  Ban,
} from "lucide-react";
import { MeetingStats, MeetingStatusFilter } from "./types";

interface MeetingStatsCardsProps {
  stats: MeetingStats;
  currentStatusFilter?: MeetingStatusFilter;
  onFilterChange?: (filter: MeetingStatusFilter) => void;
}

export function MeetingStatsCards({
  stats,
  currentStatusFilter,
  onFilterChange,
}: MeetingStatsCardsProps) {
  const cards = [
    {
      id: "ALL" as MeetingStatusFilter,
      title: "Total Meetings",
      value: stats.total,
      subtitle: `${stats.myMeetings} organized or invited`,
      icon: Calendar,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      activeRing: "ring-2 ring-indigo-500",
    },
    {
      id: "PENDING" as MeetingStatusFilter,
      title: "Pending Approval",
      value: stats.pending,
      subtitle: stats.pending > 0 ? "Requires admin review" : "No pending requests",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      activeRing: "ring-2 ring-amber-500",
    },
    {
      id: "CONFIRMED" as MeetingStatusFilter,
      title: "Confirmed",
      value: stats.confirmed,
      subtitle: "Scheduled & ready",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      activeRing: "ring-2 ring-emerald-500",
    },
    {
      id: "COMPLETED" as MeetingStatusFilter,
      title: "Completed",
      value: stats.completed,
      subtitle: "Past concluded sessions",
      icon: CalendarCheck2,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      activeRing: "ring-2 ring-blue-500",
    },
    {
      id: "CANCELLED" as MeetingStatusFilter,
      title: "Cancelled",
      value: stats.cancelled,
      subtitle: "Inventory restored",
      icon: Ban,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      activeRing: "ring-2 ring-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = currentStatusFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onFilterChange && onFilterChange(card.id)}
            className={`p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all text-left group cursor-pointer ${
              isActive ? card.activeRing : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${card.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                {card.value}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {card.subtitle}
            </p>
          </button>
        );
      })}
    </div>
  );
}
