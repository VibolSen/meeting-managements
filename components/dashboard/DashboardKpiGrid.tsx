"use client";

import React from "react";
import {
  Calendar,
  Building,
  UserCheck,
  Package,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardKpiGridProps } from "./types";

export function DashboardKpiGrid({
  summary,
  loading,
  onNavigate,
}: DashboardKpiGridProps) {
  const kpis = [
    {
      id: "meetings",
      label: "Total Meetings",
      value: summary?.totalMeetings ?? 0,
      icon: <Calendar className="w-4.5 h-4.5" />,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
      href: "/admin/meetings-approvals",
      actionText: "Manage Meetings",
      renderSubContent: () => (
        <div className="flex items-center gap-1.5 text-[11px] truncate">
          <span className="text-emerald-700 font-semibold">
            {summary?.confirmedMeetings ?? 0} Confirmed
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
            {summary?.pendingMeetings ?? 0} Pending
          </span>
        </div>
      ),
    },
    {
      id: "rooms",
      label: "Meeting Rooms",
      value: summary?.activeRooms ?? 0,
      total: summary?.totalRooms ?? 0,
      icon: <Building className="w-4.5 h-4.5" />,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      href: "/admin/room-management",
      actionText: "Manage Rooms",
      renderSubContent: () => (
        <div className="flex items-center justify-between text-[11px] text-slate-600 w-full">
          <span>Operational Ready</span>
          <Badge variant="available" size="sm">
            Active
          </Badge>
        </div>
      ),
    },
    {
      id: "staff",
      label: "Support Staff",
      value: summary?.availableStaff ?? 0,
      total: summary?.totalStaff ?? 0,
      icon: <UserCheck className="w-4.5 h-4.5" />,
      iconBg: "bg-violet-50 text-violet-600 border-violet-200",
      href: "/admin/staff-roster",
      actionText: "Staff Roster",
      renderSubContent: () => (
        <div className="flex items-center justify-between text-[11px] text-slate-600 w-full">
          <span>Ready for Duty</span>
          <Badge variant="confirmed" size="sm">
            Available
          </Badge>
        </div>
      ),
    },
    {
      id: "materials",
      label: "Materials & Gear",
      value: summary?.totalMaterials ?? 0,
      icon: <Package className="w-4.5 h-4.5" />,
      iconBg: "bg-amber-50 text-amber-600 border-amber-200",
      href: "/admin/equipment-inventory",
      actionText: "View Inventory",
      renderSubContent: () => (
        <div className="flex items-center justify-between text-[11px] text-slate-600 w-full">
          <span>Tracked Units</span>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
            Stock Tracked
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
      {kpis.map((kpi) => (
        <Card
          key={kpi.id}
          onClick={() => onNavigate(kpi.href)}
          className="p-3.5 sm:p-4 rounded-xl flex flex-col justify-between border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group select-none shadow-xs"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {kpi.label}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5 flex items-baseline gap-1">
                {loading ? (
                  <span className="inline-block w-10 h-7 bg-slate-200/70 animate-pulse rounded" />
                ) : (
                  <>
                    <span>{kpi.value}</span>
                    {kpi.total !== undefined && (
                      <span className="text-xs font-normal text-slate-500">
                        / {kpi.total}
                      </span>
                    )}
                  </>
                )}
              </h3>
            </div>

            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${kpi.iconBg}`}
            >
              {kpi.icon}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            {loading ? (
              <span className="inline-block w-24 h-4 bg-slate-100 animate-pulse rounded" />
            ) : (
              kpi.renderSubContent()
            )}
          </div>

          <div className="mt-2 flex items-center justify-end text-[10px] font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
            <span className="inline-flex items-center gap-0.5">
              {kpi.actionText}
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
