"use client";

import React from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  CalendarCheck2,
  Ban,
} from "lucide-react";
import { MyMeetingStats, MyMeetingStatusFilter } from "./types";

interface MyMeetingStatsCardsProps {
  stats: MyMeetingStats;
  currentStatusFilter?: MyMeetingStatusFilter;
  onFilterChange?: (filter: MyMeetingStatusFilter) => void;
}

export function MyMeetingStatsCards({
  stats,
  currentStatusFilter = "ALL",
  onFilterChange,
}: MyMeetingStatsCardsProps) {
  const cards = [
    {
      id: "ALL" as MyMeetingStatusFilter,
      title: "All Organized",
      value: stats.total,
      subtitle: "Total meetings coordinated",
      icon: Calendar,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      activeRing: "ring-2 ring-indigo-500",
    },
    {
      id: "CONFIRMED" as MyMeetingStatusFilter,
      title: "Confirmed",
      value: stats.confirmed,
      subtitle: "Scheduled & ready",
      icon: CheckCircle2,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      activeRing: "ring-2 ring-blue-500",
    },
    {
      id: "PENDING" as MyMeetingStatusFilter,
      title: "Pending Approval",
      value: stats.pending,
      subtitle: stats.pending > 0 ? "Awaiting boardroom review" : "No pending review",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      activeRing: "ring-2 ring-amber-500",
    },
    {
      id: "COMPLETED" as MyMeetingStatusFilter,
      title: "Completed",
      value: stats.completed,
      subtitle: "Past concluded sessions",
      icon: CalendarCheck2,
      color: "text-slate-600 bg-slate-50 border-slate-200",
      activeRing: "ring-2 ring-slate-500",
    },
    {
      id: "CANCELLED" as MyMeetingStatusFilter,
      title: "Cancelled",
      value: stats.cancelled,
      subtitle: "Inventory released",
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
            className={`p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-all text-left group cursor-pointer ${
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

export default MyMeetingStatsCards;
