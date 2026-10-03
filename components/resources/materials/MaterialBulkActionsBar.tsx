"use client";

import React from "react";
import { PlusCircle, Trash2, X } from "lucide-react";
import { RiFileExcel2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";

interface MaterialBulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAddStock: () => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
  actionLoading: boolean;
}

export function MaterialBulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkAddStock,
  onBulkExport,
  onBulkDelete,
  actionLoading,
}: MaterialBulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl shadow-2xl p-2 px-3 sm:px-4 flex items-center gap-2 sm:gap-3 border border-slate-700/80 animate-in slide-in-from-bottom-5 duration-200 text-xs">
      <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-slate-700">
        <span className="w-6 h-6 rounded-lg bg-cyan-500 text-white font-extrabold text-xs flex items-center justify-center">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold hidden sm:inline text-slate-200">
          {selectedCount === 1 ? "Item Selected" : "Items Selected"}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Quick Replenish +5 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBulkAddStock}
          disabled={actionLoading}
          leftIcon={<PlusCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
          className="text-xs text-slate-200 hover:text-white hover:bg-slate-800 h-8 px-2.5"
        >
          +5 Stock
        </Button>

        {/* Export Selected */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBulkExport}
          disabled={actionLoading}
          leftIcon={<RiFileExcel2Line className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          className="text-xs text-slate-200 hover:text-white hover:bg-slate-800 h-8 px-2.5"
        >
          Export
        </Button>

        {/* Bulk Delete */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBulkDelete}
          disabled={actionLoading}
          leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
          className="text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/50 h-8 px-2.5"
        >
          Delete
        </Button>

        {/* Clear Selection */}
        <button
          type="button"
          onClick={onClearSelection}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer ml-1"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
