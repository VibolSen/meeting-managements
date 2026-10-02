import React from "react";
import { Users, UserCheck, ShieldAlert, ShieldCheck, Briefcase, User } from "lucide-react";

export interface UserStats {
  total: number;
  active: number;
  suspended: number;
  admins: number;
  organizers: number;
  employees: number;
}

interface UserStatsCardsProps {
  stats: UserStats;
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {/* Total Users */}
      <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</p>
          <Users className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <p className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.total}</p>
      </div>

      {/* Active Accounts */}
      <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/30 shadow-xs hover:border-emerald-200 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Active</p>
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{stats.active}</p>
      </div>

      {/* Suspended Accounts */}
      <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/30 shadow-xs hover:border-rose-200 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Suspended</p>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
        </div>
        <p className="text-xl font-extrabold text-rose-700 mt-0.5">{stats.suspended}</p>
      </div>

      {/* Admins */}
      <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 shadow-xs hover:border-indigo-200 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Admins</p>
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
        </div>
        <p className="text-xl font-extrabold text-indigo-900 mt-0.5">{stats.admins}</p>
      </div>

      {/* Organizers */}
      <div className="p-3 rounded-xl border border-violet-100 bg-violet-50/30 shadow-xs hover:border-violet-200 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Organizers</p>
          <Briefcase className="w-3.5 h-3.5 text-violet-600" />
        </div>
        <p className="text-xl font-extrabold text-violet-900 mt-0.5">{stats.organizers}</p>
      </div>

      {/* Employees */}
      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Employees</p>
          <User className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <p className="text-xl font-extrabold text-slate-700 mt-0.5">{stats.employees}</p>
      </div>
    </div>
  );
}
