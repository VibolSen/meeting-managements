"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimelineHeaderProps } from "./types";

export function TimelineHeader({
  selectedDate,
  formattedDateTitle,
  rooms,
  filterRoomId,
  viewMode,
  loading,
  onPrevDay,
  onNextDay,
  onToday,
  onDateChange,
  onFilterRoomChange,
  onViewModeChange,
  onRefresh,
}: TimelineHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
      {/* Left: Date Navigation & Picker */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Day Navigation buttons */}
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevDay}
            className="h-7.5 w-7.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToday}
            className="h-7.5 px-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-white transition-colors"
          >
            Today
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNextDay}
            className="h-7.5 w-7.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Date Picker Input */}
        <div className="relative flex items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-8.5 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs cursor-pointer"
          />
        </div>

        <span className="text-sm font-bold text-slate-900 hidden sm:inline-block ml-1">
          {formattedDateTitle}
        </span>
      </div>

      {/* Right: Filter & View Mode Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Room Filter Dropdown */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          <select
            value={filterRoomId}
            onChange={(e) => onFilterRoomChange(e.target.value)}
            className="h-8.5 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-xs cursor-pointer"
          >
            <option value="ALL">All Rooms ({rooms.length})</option>
            {rooms.map((room) => (
              <option key={room.roomId} value={room.roomId}>
                {room.name} (Cap: {room.capacity})
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle: Timeline vs Agenda */}
        <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => onViewModeChange("timeline")}
            className={`h-7.5 px-3 rounded-lg transition-all cursor-pointer select-none font-semibold ${
              viewMode === "timeline"
                ? "bg-white text-indigo-600 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Timeline
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("agenda")}
            className={`h-7.5 px-3 rounded-lg transition-all cursor-pointer select-none font-semibold ${
              viewMode === "agenda"
                ? "bg-white text-indigo-600 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Agenda
          </button>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          isLoading={loading}
          className="h-8.5 w-8.5 bg-white text-slate-600 hover:text-slate-900"
          title="Refresh Schedule"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
