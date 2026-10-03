"use client";

import React from "react";
import { Calendar, CheckCircle2, Clock, Building } from "lucide-react";

interface OrganizerKPICardsProps {
  totalOrganized: number;
  confirmedCount: number;
  pendingCount: number;
  availableRooms: number;
  loading?: boolean;
}

export function OrganizerKPICards({
  totalOrganized,
  confirmedCount,
  pendingCount,
  availableRooms,
  loading = false,
}: OrganizerKPICardsProps) {
  const cards = [
    {
      title: "My Total Meetings",
      value: totalOrganized,
      description: "Conferences organized by you",
      icon: <Calendar className="w-5 h-5 text-indigo-600" />,
      bgIcon: "bg-indigo-50 text-indigo-600 border border-indigo-100",
      accentBorder: "hover:border-indigo-300",
    },
    {
      title: "Confirmed & Active",
      value: confirmedCount,
      description: "Scheduled without conflicts",
      icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
      bgIcon: "bg-blue-50 text-blue-600 border border-blue-100",
      accentBorder: "hover:border-blue-300",
    },
    {
      title: "Pending Approvals",
      value: pendingCount,
      description: "Awaiting boardroom confirmation",
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bgIcon: "bg-amber-50 text-amber-600 border border-amber-100",
      accentBorder: "hover:border-amber-300",
    },
    {
      title: "Active Spaces",
      value: availableRooms,
      description: "Available system rooms",
      icon: <Building className="w-5 h-5 text-indigo-600" />,
      bgIcon: "bg-indigo-50 text-indigo-600 border border-indigo-100",
      accentBorder: "hover:border-indigo-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs transition-all duration-200 hover:shadow-sm ${card.accentBorder}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {card.title}
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${card.bgIcon}`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="h-7 w-16 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {card.value}
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-0.5 truncate font-medium">
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrganizerKPICards;
