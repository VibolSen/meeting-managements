"use client";

import React from "react";
import { TimelineLegendProps } from "./types";

export function TimelineLegend({ showHint = true }: TimelineLegendProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-500">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
          <span className="font-semibold text-slate-700">Confirmed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
          <span className="font-semibold text-slate-700">
            Pending Approval (Cap &ge; 20)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span className="font-semibold text-slate-700">Free / Available Slot</span>
        </div>
      </div>

      {showHint && (
        <p className="text-[11px] text-slate-500 italic hidden sm:block">
          💡 Click any empty hourly slot to book directly, or click a meeting block to view details.
        </p>
      )}
    </div>
  );
}
