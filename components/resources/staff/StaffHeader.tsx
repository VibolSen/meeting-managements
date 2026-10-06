"use client";

import React from "react";
import { UserCheck, Plus, RefreshCw, Upload } from "lucide-react";
import { RiFileExcel2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StaffHeaderProps {
  isAdmin: boolean;
  loading: boolean;
  totalStaff: number;
  onRefresh: () => void;
  onAddStaff: () => void;
  onImportStaff: () => void;
  onExportExcel: () => void;
}

export function StaffHeader({
  isAdmin,
  loading,
  totalStaff,
  onRefresh,
  onAddStaff,
  onImportStaff,
  onExportExcel,
}: StaffHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-violet-50/70 via-white to-slate-50 dark:from-slate-900/95 dark:via-[#111827] dark:to-violet-950/30 shadow-xs">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
            <UserCheck className="w-5 h-5" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Support Staff & Logistics Roster
          </span>
          <Badge variant="neutral" size="sm" className="font-mono">
            {totalStaff} {totalStaff === 1 ? "Member" : "Members"}
          </Badge>
          {isAdmin ? (
            <Badge variant="confirmed" size="sm">Admin Access</Badge>
          ) : (
            <Badge variant="neutral" size="sm">Read Only</Badge>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 pl-1">
          Coordinate on-site IT technicians, reception hosts, and meeting moderators deployed across facilities.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          title="Refresh Staff Roster"
        >
          Refresh
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportExcel}
          leftIcon={<RiFileExcel2Line className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          className="text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/90 border-emerald-200"
          title="Export Roster to Excel"
        >
          Export
        </Button>

        {isAdmin && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onImportStaff}
              leftIcon={<Upload className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
              className="text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/90 border-indigo-200"
              title="Import from Excel or Google Sheets"
            >
              Import
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onAddStaff}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Enroll Staff
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
