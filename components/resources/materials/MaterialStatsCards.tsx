"use client";

import React from "react";
import { Package, Box, AlertTriangle, Layers } from "lucide-react";
import { MaterialStats } from "./types";

interface MaterialStatsCardsProps {
  stats: MaterialStats;
}

export function MaterialStatsCards({ stats }: MaterialStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Catalog Items */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-slate-300 transition-all">
        <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 shrink-0">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Catalog Items
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {stats.totalItems}
            </span>
            <span className="text-xs text-slate-400">types</span>
          </div>
        </div>
      </div>

      {/* Total Units Available */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-blue-200 transition-all">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
          <Box className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Stock
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-bold font-mono text-blue-600">
              {stats.totalUnits}
            </span>
            <span className="text-xs text-blue-600/70">units</span>
          </div>
        </div>
      </div>

      {/* Low Stock Warning */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-amber-200 transition-all">
        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Low Stock Alerts
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span
              className={`text-2xl font-bold font-mono ${
                stats.lowStockCount > 0 ? "text-amber-600" : "text-slate-900"
              }`}
            >
              {stats.lowStockCount}
            </span>
            <span className="text-xs text-amber-600/70">&lt; 5 units</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5 hover:border-purple-200 transition-all">
        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Categories
          </p>
          <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-slate-600">
            <span className="text-indigo-600 font-bold">{stats.equipmentCount} AV</span>
            <span>&bull;</span>
            <span className="text-emerald-600 font-bold">{stats.stationeryCount} Stat</span>
            <span>&bull;</span>
            <span className="text-amber-600 font-bold">{stats.cateringCount} Food</span>
          </div>
        </div>
      </div>
    </div>
  );
}
