"use client";

import React from "react";
import { Search, Filter, X, ArrowUpDown } from "lucide-react";
import { InvitationStatusFilter, InvitationSortField, InvitationSortOrder } from "./types";

interface InvitationFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: InvitationStatusFilter;
  onStatusFilterChange: (status: InvitationStatusFilter) => void;
  sortField: InvitationSortField;
  onSortFieldChange: (field: InvitationSortField) => void;
  sortOrder: InvitationSortOrder;
  onSortOrderChange: (order: InvitationSortOrder) => void;
  onResetFilters: () => void;
}

export function InvitationFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderChange,
  onResetFilters,
}: InvitationFilterBarProps) {
  const hasActiveFilters = searchQuery !== "" || statusFilter !== "ALL";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Search Bar */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by meeting, organizer, room..."
          className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter and Sort Options */}
      <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap justify-between md:justify-end">
        {/* RSVP Status Dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as InvitationStatusFilter)}
            className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All RSVPs</option>
            <option value="PENDING">Pending Response</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="DECLINED">Declined</option>
          </select>
        </div>

        {/* Sort Field */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortField}
            onChange={(e) => onSortFieldChange(e.target.value as InvitationSortField)}
            className="py-1.5 px-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="startTime">Meeting Date</option>
            <option value="title">Meeting Title</option>
            <option value="organizer">Organizer</option>
            <option value="rsvpStatus">My RSVP</option>
          </select>

          <button
            type="button"
            onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
            className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold cursor-pointer shadow-2xs"
            title={`Sort Order: ${sortOrder.toUpperCase()}`}
          >
            {sortOrder.toUpperCase()}
          </button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export default InvitationFilterBar;
