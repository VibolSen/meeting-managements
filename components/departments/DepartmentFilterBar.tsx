import React from "react";
import {
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  List,
  LayoutGrid,
} from "lucide-react";
import { RiFileExcel2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";

export type DepartmentSortField = "name" | "members" | "id";
export type SortOrder = "asc" | "desc";
export type DepartmentViewMode = "table" | "grid";

interface DepartmentFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: DepartmentSortField;
  onSortByChange: (field: DepartmentSortField) => void;
  sortOrder: SortOrder;
  onToggleSortOrder: () => void;
  onResetFilters: () => void;
  isFiltered: boolean;
  totalResults: number;
  viewMode: DepartmentViewMode;
  onViewModeChange: (mode: DepartmentViewMode) => void;
  onExportExcel?: () => void;
}

export function DepartmentFilterBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onToggleSortOrder,
  onResetFilters,
  isFiltered,
  totalResults,
  viewMode,
  onViewModeChange,
  onExportExcel,
}: DepartmentFilterBarProps) {
  return (
    <div className="space-y-1.5">
      {/* Main Filter & Sort Controls Card */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col gap-2.5">
        {/* Row 1: Search Bar Only */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search departments by name or description..."
            className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50/80 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-900 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Row 2: Sort, Export & View Mode Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
          {/* Left: Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort by Field */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 h-8">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as DepartmentSortField)}
                className="text-xs bg-transparent focus:outline-none font-semibold text-slate-800 cursor-pointer pr-1"
                title="Sort by Field"
              >
                <option value="name">Name</option>
                <option value="members">Member Count</option>
                <option value="id">Department ID</option>
              </select>
            </div>

            {/* Sort Direction Toggle Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleSortOrder}
              leftIcon={
                sortOrder === "asc" ? (
                  <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                )
              }
              title={`Sort Order: ${sortOrder === "asc" ? "Ascending (A-Z / Low-High)" : "Descending (Z-A / High-Low)"}`}
              className="text-[11px] font-semibold text-slate-700 px-2.5 h-8"
            >
              {sortOrder === "asc" ? "Asc" : "Desc"}
            </Button>
          </div>

          {/* Right: Export, View Switcher & Reset */}
          <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
            {/* Export to Excel Button with Excel Icon */}
            {onExportExcel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onExportExcel}
                leftIcon={<RiFileExcel2Line className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                title="Export filtered departments to Excel (.xlsx)"
                className="text-[11px] font-semibold text-slate-700 px-2.5 h-8 hover:text-emerald-700 hover:border-emerald-200"
              >
                Export
              </Button>
            )}

            {/* View Mode Switcher (Table vs Grid) */}
            <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 h-8">
              <button
                type="button"
                onClick={() => onViewModeChange("table")}
                className={`p-1 rounded-md transition-all cursor-pointer h-7 w-7 flex items-center justify-center ${
                  viewMode === "table"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange("grid")}
                className={`p-1 rounded-md transition-all cursor-pointer h-7 w-7 flex items-center justify-center ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reset Filters Button */}
            {isFiltered && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onResetFilters}
                leftIcon={<RotateCcw className="w-3.5 h-3.5 text-rose-600" />}
                className="text-[11px] font-bold text-rose-700 bg-rose-50/60 hover:bg-rose-100/80 border-rose-200 px-2.5 h-8"
                title="Reset search and sorting"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Status & Active Search Pill */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-500">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400">
            Found <strong className="text-slate-700">{totalResults}</strong>{" "}
            {totalResults === 1 ? "department" : "departments"}
          </span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              Keyword: "{searchQuery}"
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="hover:text-amber-900 cursor-pointer ml-0.5"
              >
                ×
              </button>
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-400 hidden sm:block">
          Sorted by <span className="font-semibold text-slate-600 capitalize">{sortBy}</span> (
          {sortOrder === "asc" ? "Asc" : "Desc"})
        </div>
      </div>
    </div>
  );
}
