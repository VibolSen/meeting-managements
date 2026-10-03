"use client";

import React from "react";
import { Mail, Clock, CheckCircle2, XCircle } from "lucide-react";
import { InvitationStats, InvitationStatusFilter } from "./types";

interface InvitationStatsCardsProps {
  stats: InvitationStats;
  currentFilter: InvitationStatusFilter;
  onFilterChange: (filter: InvitationStatusFilter) => void;
}

export function InvitationStatsCards({
  stats,
  currentFilter = "ALL",
  onFilterChange,
}: InvitationStatsCardsProps) {
  const cards = [
    {
      id: "ALL" as InvitationStatusFilter,
      title: "Total Invitations",
      value: stats.total,
      subtitle: "All meetings you were invited to",
      icon: Mail,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      activeRing: "ring-2 ring-indigo-500",
    },
    {
      id: "PENDING" as InvitationStatusFilter,
      title: "Pending RSVP",
      value: stats.pending,
      subtitle: stats.pending > 0 ? "Action required" : "All responded",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      activeRing: "ring-2 ring-amber-500",
    },
    {
      id: "ACCEPTED" as InvitationStatusFilter,
      title: "Accepted",
      value: stats.accepted,
      subtitle: "Attending confirmed",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      activeRing: "ring-2 ring-emerald-500",
    },
    {
      id: "DECLINED" as InvitationStatusFilter,
      title: "Declined",
      value: stats.declined,
      subtitle: "Cannot attend",
      icon: XCircle,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      activeRing: "ring-2 ring-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = currentFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onFilterChange(card.id)}
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

export default InvitationStatsCards;
