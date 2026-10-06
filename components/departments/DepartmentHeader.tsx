import React from "react";
import { Building, Plus, RefreshCw } from "lucide-react";
import { RiFileExcel2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";

interface DepartmentHeaderProps {
  isAdmin: boolean;
  loading: boolean;
  onRefresh: () => void;
  onAddDepartment: () => void;
  onImportDepartments?: () => void;
}

export function DepartmentHeader({
  isAdmin,
  loading,
  onRefresh,
  onAddDepartment,
  onImportDepartments,
}: DepartmentHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-slate-900/95 dark:via-[#111827] dark:to-slate-900/90 shadow-xs">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Building className="w-4 h-4" />
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Department Management
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure company divisions, functional teams, organizational structures, and staff allocations.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh
        </Button>

        {isAdmin && onImportDepartments && (
          <Button
            variant="outline"
            size="sm"
            onClick={onImportDepartments}
            leftIcon={<RiFileExcel2Line className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            title="Import departments from Excel or Google Sheets"
          >
            Import
          </Button>
        )}

        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAddDepartment}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Department
          </Button>
        )}
      </div>
    </div>
  );
}
