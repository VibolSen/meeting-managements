"use client";

import React from "react";
import {
  Search,
  X,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { RiFileExcel2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import {
  RoomSortField,
  SortOrder,
  RoomViewMode,
  RoomStatusFilter,
  RoomCapacityFilter,
} from "./types";

interface RoomFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: RoomStatusFilter;
  onStatusFilterChange: (status: RoomStatusFilter) => void;
  capacityFilter: RoomCapacityFilter;
  onCapacityFilterChange: (filter: RoomCapacityFilter) => void;
  sortBy: RoomSortField;
  onSortByChange: (field: RoomSortField) => void;
  sortOrder: SortOrder;
  onToggleSortOrder: () => void;
  viewMode: RoomViewMode;
  onViewModeChange: (mode: RoomViewMode) => void;
  onResetFilters: () => void;
  isFiltered: boolean;
  totalResults: number;
  onExportExcel: () => void;
}

export function RoomFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  capacityFilter,
  onCapacityFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onToggleSortOrder,
  viewMode,
  onViewModeChange,
  onResetFilters,
  isFiltered,
  totalResults,
  onExportExcel,
}: RoomFilterBarProps) {
  return (
    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
      {/* ROW 1: Search Bar (Full Width) */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search rooms by name, floor, or location (e.g., Boardroom, Floor 4, West Wing)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ROW 2: Filter Dropdowns, Sorters, View Mode & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Left Side: Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80 h-8">
            <span className="font-semibold text-slate-500 text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as RoomStatusFilter)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Available / Active</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Capacity Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80 h-8">
            <span className="font-semibold text-slate-500 text-[11px]">Capacity:</span>
            <select
              value={capacityFilter}
              onChange={(e) => onCapacityFilterChange(e.target.value as RoomCapacityFilter)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Sizes</option>
              <option value="SMALL">Small (1 - 10)</option>
              <option value="MEDIUM">Medium (11 - 20)</option>
              <option value="LARGE">Large / Boardroom (21+)</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80 h-8">
            <span className="font-semibold text-slate-500 text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as RoomSortField)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer text-xs"
            >
              <option value="name">Room Name</option>
              <option value="location">Location / Floor</option>
              <option value="capacity">Capacity</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleSortOrder}
            leftIcon={
              sortOrder === "asc" ? (
                <ArrowUp className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              )
            }
            title={`Sort Order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
            className="text-[11px] font-semibold text-slate-700 px-2.5 h-8"
          >
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </Button>

          {/* Reset Filters */}
          {isFiltered && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 h-8"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Right Side: Total Matching, View Mode Toggle, Excel Export */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-slate-500 hidden md:inline font-mono">
            {totalResults} {totalResults === 1 ? "room" : "rooms"} found
          </span>

          {/* Excel Export Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExportExcel}
            leftIcon={<RiFileExcel2Line className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            className="text-[11px] font-semibold text-slate-700 px-2.5 h-8 hover:text-emerald-700 hover:border-emerald-200"
            title="Export filtered list to Excel (.xlsx)"
          >
            Export
          </Button>

          {/* View Mode Toggle: Table / Grid */}
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 h-8">
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={`p-1 rounded-md transition-all cursor-pointer h-7 w-7 flex items-center justify-center ${
                viewMode === "table"
                  ? "bg-white text-indigo-600 shadow-xs font-semibold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-1 rounded-md transition-all cursor-pointer h-7 w-7 flex items-center justify-center ${
                viewMode === "grid"
                  ? "bg-white text-indigo-600 shadow-xs font-semibold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
