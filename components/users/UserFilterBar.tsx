import React from "react";
import {
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Building,
  Shield,
  UserCheck,
  List,
  LayoutGrid,
} from "lucide-react";
import { RiFileExcel2Line } from "react-icons/ri";
import { Department } from "@/lib/api";
import { Button } from "@/components/ui/button";

export type UserSortField = "name" | "email" | "role" | "department" | "status" | "id";
export type SortOrder = "asc" | "desc";
export type UserViewMode = "table" | "grid";

interface UserFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (deptId: string) => void;
  departments: Department[];
  sortBy: UserSortField;
  onSortByChange: (field: UserSortField) => void;
  sortOrder: SortOrder;
  onToggleSortOrder: () => void;
  onResetFilters: () => void;
  isFiltered: boolean;
  totalResults: number;
  viewMode: UserViewMode;
  onViewModeChange: (mode: UserViewMode) => void;
  onExportCSV?: () => void;
  onExportExcel?: () => void;
}

export function UserFilterBar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  departments,
  sortBy,
  onSortByChange,
  sortOrder,
  onToggleSortOrder,
  onResetFilters,
  isFiltered,
  totalResults,
  viewMode,
  onViewModeChange,
  onExportCSV,
  onExportExcel,
}: UserFilterBarProps) {
  const handleExport = onExportExcel || onExportCSV;

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
            placeholder="Search users by name, email, department..."
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

        {/* Row 2: Small Filter and Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
          {/* Left Group: Filters (Status, Role, Department) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by: Status */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 h-8">
              <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="text-xs bg-transparent focus:outline-none font-semibold text-slate-800 cursor-pointer pr-1"
                title="Filter by Status"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            {/* Filter by: Role */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 h-8">
              <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                Role:
              </span>
              <select
                value={roleFilter}
                onChange={(e) => onRoleFilterChange(e.target.value)}
                className="text-xs bg-transparent focus:outline-none font-semibold text-slate-800 cursor-pointer pr-1"
                title="Filter by Role"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="ORGANIZER">ORGANIZER</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
              </select>
            </div>

            {/* Filter by: Department */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 h-8">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                Dept:
              </span>
              <select
                value={departmentFilter}
                onChange={(e) => onDepartmentFilterChange(e.target.value)}
                className="text-xs bg-transparent focus:outline-none font-semibold text-slate-800 cursor-pointer max-w-[140px] truncate pr-1"
                title="Filter by Department"
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.departmentId} value={String(dept.departmentId)}>
                    {dept.name}
                  </option>
                ))}
                <option value="UNASSIGNED">Unassigned</option>
              </select>
            </div>
          </div>

          {/* Right Group: Sorting, View Switcher & Export */}
          <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
            {/* Sort by Field */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 h-8">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as UserSortField)}
                className="text-xs bg-transparent focus:outline-none font-semibold text-slate-800 cursor-pointer pr-1"
                title="Sort by Field"
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
                <option value="status">Status</option>
                <option value="department">Department</option>
                <option value="id">User ID</option>
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
              title={`Sort Order: ${sortOrder === "asc" ? "Ascending (A-Z / 1-9)" : "Descending (Z-A / 9-1)"}`}
              className="text-[11px] font-semibold text-slate-700 px-2.5 h-8"
            >
              {sortOrder === "asc" ? "Asc" : "Desc"}
            </Button>

            {/* Export to Excel Button with Excel Icon */}
            {handleExport && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExport}
                leftIcon={<RiFileExcel2Line className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                title="Export filtered directory to Excel"
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
                title="Reset all filters and sorting"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Status & Active Pills (when filters are active) */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-500">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400">
            Found <strong className="text-slate-700">{totalResults}</strong> {totalResults === 1 ? "member" : "members"}
          </span>

          {statusFilter !== "ALL" && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                statusFilter === "SUSPENDED"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              Status: {statusFilter}
              <button
                type="button"
                onClick={() => onStatusFilterChange("ALL")}
                className="hover:opacity-75 cursor-pointer ml-0.5"
              >
                ×
              </button>
            </span>
          )}

          {roleFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Role: {roleFilter}
              <button
                type="button"
                onClick={() => onRoleFilterChange("ALL")}
                className="hover:text-indigo-900 cursor-pointer ml-0.5"
              >
                ×
              </button>
            </span>
          )}

          {departmentFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
              Dept: {departmentFilter === "UNASSIGNED" ? "Unassigned" : departments.find((d) => String(d.departmentId) === departmentFilter)?.name || departmentFilter}
              <button
                type="button"
                onClick={() => onDepartmentFilterChange("ALL")}
                className="hover:text-violet-900 cursor-pointer ml-0.5"
              >
                ×
              </button>
            </span>
          )}

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
          Sorted by <span className="font-semibold text-slate-600 capitalize">{sortBy}</span> ({sortOrder === "asc" ? "Asc" : "Desc"})
        </div>
      </div>
    </div>
  );
}
