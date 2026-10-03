"use client";

import React from "react";
import { Building, CheckCircle2, Wrench, Users } from "lucide-react";
import { RoomStats } from "./types";

interface RoomStatsCardsProps {
  stats: RoomStats;
}

export function RoomStatsCards({ stats }: RoomStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Rooms */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-slate-300 transition-all">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
          <Building className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Facilities
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {stats.total}
            </span>
            <span className="text-xs text-slate-400">rooms</span>
          </div>
        </div>
      </div>

      {/* Available Rooms */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-emerald-200 transition-all">
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Available
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {stats.active}
            </span>
            <span className="text-xs text-emerald-600/70">bookable</span>
          </div>
        </div>
      </div>

      {/* Under Maintenance */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-amber-200 transition-all">
        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Maintenance
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold font-mono text-amber-600">
              {stats.maintenance}
            </span>
            <span className="text-xs text-amber-600/70">servicing</span>
          </div>
        </div>
      </div>

      {/* Total Capacity */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-indigo-200 transition-all">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Capacity
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold font-mono text-indigo-600">
              {stats.totalCapacity}
            </span>
            <span className="text-xs text-indigo-600/70">seats</span>
          </div>
        </div>
      </div>
    </div>
  );
}
