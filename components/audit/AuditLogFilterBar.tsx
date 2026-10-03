"use client";

import React from "react";
import { Search, Filter, Download, RotateCcw, Calendar } from "lucide-react";
import { AuditActionType, AuditEntityType } from "@/lib/api";

interface AuditLogFilterBarProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  actionType: string;
  onActionTypeChange: (val: string) => void;
  entityType: string;
  onEntityTypeChange: (val: string) => void;
  dateRange: string;
  onDateRangeChange: (val: string) => void;
  onReset: () => void;
  onExport: () => void;
  isExporting: boolean;
}

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Actions" },
  { value: "CREATE", label: "Create / Schedule" },
  { value: "UPDATE", label: "Update" },
  { value: "APPROVE", label: "Approve" },
  { value: "CANCEL", label: "Cancel" },
  { value: "DELETE", label: "Delete" },
  { value: "ROLE_CHANGE", label: "Role Change" },
  { value: "STATUS_CHANGE", label: "Status Change" },
  { value: "LOGIN", label: "User Login" },
];

const ENTITY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Entities" },
  { value: "MEETING", label: "Meeting" },
  { value: "ROOM", label: "Meeting Room" },
  { value: "MATERIAL", label: "Material / Equipment" },
  { value: "STAFF", label: "Support Staff" },
  { value: "USER", label: "User Account" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "SYSTEM", label: "System Core" },
];

const DATE_RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "7days", label: "Past 7 Days" },
  { value: "30days", label: "Past 30 Days" },
];

export function AuditLogFilterBar({
  keyword,
  onKeywordChange,
  actionType,
  onActionTypeChange,
  entityType,
  onEntityTypeChange,
  dateRange,
  onDateRangeChange,
  onReset,
  onExport,
  isExporting,
}: AuditLogFilterBarProps) {
  const hasActiveFilters = Boolean(keyword || actionType || entityType || dateRange !== "all");

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by actor name, email, entity name, or details..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>

        {/* Action Buttons: Export & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Clear all filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>
        </div>
      </div>

      {/* Filter Dropdowns Strip */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Action Type Dropdown */}
        <select
          value={actionType}
          onChange={(e) => onActionTypeChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
        >
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Entity Type Dropdown */}
        <select
          value={entityType}
          onChange={(e) => onEntityTypeChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
        >
          {ENTITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Date Range Selector */}
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
        >
          {DATE_RANGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
