import React from "react";
import { Building, Users, UserX, Award } from "lucide-react";

export interface DepartmentStats {
  totalDepts: number;
  assignedMembers: number;
  unassignedMembers: number;
  largestDeptName?: string;
  largestDeptCount?: number;
}

interface DepartmentStatsCardsProps {
  stats: DepartmentStats;
}

export function DepartmentStatsCards({ stats }: DepartmentStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {/* Total Departments */}
      <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Departments</p>
          <Building className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <p className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.totalDepts}</p>
      </div>

      {/* Assigned Members */}
      <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 shadow-xs hover:border-indigo-200 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Assigned Members</p>
          <Users className="w-3.5 h-3.5 text-indigo-600" />
        </div>
        <p className="text-xl font-extrabold text-indigo-900 mt-0.5">{stats.assignedMembers}</p>
      </div>

      {/* Unassigned Members */}
      <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/30 shadow-xs hover:border-amber-200 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Unassigned</p>
          <UserX className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <p className="text-xl font-extrabold text-amber-800 mt-0.5">{stats.unassignedMembers}</p>
      </div>

      {/* Largest Department */}
      <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/30 shadow-xs hover:border-emerald-200 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Largest Dept</p>
          <Award className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="mt-0.5 truncate">
          <p className="text-sm font-bold text-emerald-900 truncate">
            {stats.largestDeptName || "None"}
          </p>
          <p className="text-[10px] font-medium text-emerald-700">
            {stats.largestDeptCount !== undefined ? `${stats.largestDeptCount} members` : "0 members"}
          </p>
        </div>
      </div>
    </div>
  );
}
