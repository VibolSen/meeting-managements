import React from "react";
import { Users, Plus, RefreshCw } from "lucide-react";
import { RiFileExcel2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";

interface UserHeaderProps {
  isAdmin: boolean;
  loading: boolean;
  onRefresh: () => void;
  onAddUser: () => void;
  onImportUsers?: () => void;
}

export function UserHeader({
  isAdmin,
  loading,
  onRefresh,
  onAddUser,
  onImportUsers,
}: UserHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 shadow-xs">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            User Management
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage system member accounts, assign credentials, security roles, and department affiliations.
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

        {isAdmin && onImportUsers && (
          <Button
            variant="outline"
            size="sm"
            onClick={onImportUsers}
            leftIcon={<RiFileExcel2Line className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            title="Import users from Excel or Google Sheets"
          >
            Import
          </Button>
        )}

        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAddUser}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add User
          </Button>
        )}
      </div>
    </div>
  );
}
