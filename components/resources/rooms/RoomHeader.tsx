"use client";

import React from "react";
import { Building, Plus, RefreshCw, Upload } from "lucide-react";
import { RiFileExcel2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoomHeaderProps {
  isAdmin: boolean;
  loading: boolean;
  totalRooms: number;
  onRefresh: () => void;
  onAddRoom: () => void;
  onImportRooms: () => void;
  onExportExcel: () => void;
}

export function RoomHeader({
  isAdmin,
  loading,
  totalRooms,
  onRefresh,
  onAddRoom,
  onImportRooms,
  onExportExcel,
}: RoomHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50/70 via-white to-slate-50 shadow-xs">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
            <Building className="w-5 h-5" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Meeting Rooms & Facilities
          </span>
          <Badge variant="neutral" size="sm" className="font-mono">
            {totalRooms} {totalRooms === 1 ? "Room" : "Rooms"}
          </Badge>
          {isAdmin ? (
            <Badge variant="confirmed" size="sm">Admin Access</Badge>
          ) : (
            <Badge variant="neutral" size="sm">Read Only</Badge>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 pl-1">
          Manage physical conference spaces, seating capacities, executive boardrooms, and operational statuses.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          title="Refresh Room List"
        >
          Refresh
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportExcel}
          leftIcon={<RiFileExcel2Line className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          className="text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/90 border-emerald-200"
          title="Export Rooms to Excel"
        >
          Export
        </Button>

        {isAdmin && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onImportRooms}
              leftIcon={<Upload className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
              className="text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/90 border-indigo-200"
              title="Import from Excel or Google Sheets"
            >
              Import
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onAddRoom}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Room
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
