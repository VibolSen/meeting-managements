"use client";

import React from "react";
import { ShieldCheck, CalendarClock, CheckCircle2, KeyRound, Activity } from "lucide-react";
import { AuditLogSummary } from "@/lib/api";

interface AuditLogStatsProps {
  summary: AuditLogSummary | null;
  loading: boolean;
}

export function AuditLogStats({ summary, loading }: AuditLogStatsProps) {
  const cards = [
    {
      title: "Total Audit Events",
      value: summary?.totalLogs ?? 0,
      description: "Immutable compliance & system records",
      icon: ShieldCheck,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      title: "Events Logged Today",
      value: summary?.logsToday ?? 0,
      description: "Active system transactions & audits",
      icon: CalendarClock,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Governance Approvals",
      value: summary?.approvalActions ?? 0,
      description: "Boardroom & policy sign-offs",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Security & Role Changes",
      value: summary?.securityActions ?? 0,
      description: "Logins & administrative role grants",
      icon: KeyRound,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {loading ? (
              <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse mb-1" />
            ) : (
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {card.value.toLocaleString()}
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-0.5">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
}
