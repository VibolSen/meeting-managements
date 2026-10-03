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
import { Room } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  MeetingSortField,
  SortOrder,
  MeetingViewMode,
  MeetingStatusFilter,
} from "./types";

interface MeetingFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: MeetingStatusFilter;
  onStatusFilterChange: (status: MeetingStatusFilter) => void;
  roomIdFilter: number | "ALL";
  onRoomIdFilterChange: (roomId: number | "ALL") => void;
  rooms: Room[];
  sortBy: MeetingSortField;
  onSortByChange: (field: MeetingSortField) => void;
  sortOrder: SortOrder;
  onToggleSortOrder: () => void;
  viewMode: MeetingViewMode;
  onViewModeChange: (mode: MeetingViewMode) => void;
  onResetFilters: () => void;
  isFiltered: boolean;
  totalResults: number;
  onExportExcel: () => void;
}

export function MeetingFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  roomIdFilter,
  onRoomIdFilterChange,
  rooms,
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
}: MeetingFilterBarProps) {
  return (
    <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
      {/* Row 1: Full-Width Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by meeting title, purpose, organizer, or room facility..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Row 2: Controls, Dropdowns & View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as MeetingStatusFilter)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer h-8 shadow-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Approval</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="MINE">My Meetings</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Room Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Room:</span>
            <select
              value={roomIdFilter}
              onChange={(e) =>
                onRoomIdFilterChange(
                  e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                )
              }
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer h-8 max-w-[160px] truncate shadow-xs"
            >
              <option value="ALL">All Facilities</option>
              {rooms.map((room) => (
                <option key={room.roomId} value={room.roomId}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as MeetingSortField)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer h-8 shadow-xs"
            >
              <option value="startTime">Start Date & Time</option>
              <option value="title">Meeting Title</option>
              <option value="room">Room Location</option>
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
            className="text-[11px] font-semibold text-slate-700 px-2.5 h-8 border-slate-200 hover:bg-slate-50"
            title={`Sort order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
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

        {/* View Mode & Excel Export */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-slate-500 hidden md:inline font-mono">
            {totalResults} {totalResults === 1 ? "meeting" : "meetings"} found
          </span>

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
