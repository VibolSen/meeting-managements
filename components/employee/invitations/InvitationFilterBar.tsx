"use client";

import React from "react";
import { Search, MailCheck, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export type InvitationTab = "all" | "PENDING" | "ACCEPTED" | "DECLINED";

interface InvitationFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: InvitationTab;
  onTabChange: (tab: InvitationTab) => void;
  pendingCount: number;
}

export function InvitationFilterBar({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  pendingCount,
}: InvitationFilterBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter invitations by title, host, room..."
          className="pl-9 text-xs h-9"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
        <button
          onClick={() => onTabChange("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Invitations
        </button>

        <button
          onClick={() => onTabChange("PENDING")}
          className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === "PENDING"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
          }`}
        >
          <span>Pending Action</span>
          {pendingCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "PENDING"
                  ? "bg-white text-amber-800"
                  : "bg-amber-600 text-white"
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange("ACCEPTED")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === "ACCEPTED"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
          }`}
        >
          Accepted
        </button>

        <button
          onClick={() => onTabChange("DECLINED")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === "DECLINED"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
          }`}
        >
          Declined
        </button>
      </div>
    </div>
  );
}

export default InvitationFilterBar;
