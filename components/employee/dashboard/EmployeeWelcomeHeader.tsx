"use client";

import React, { useState, useEffect } from "react";
import { User, api } from "@/lib/api";
import { Calendar, RefreshCw } from "lucide-react";

interface EmployeeWelcomeHeaderProps {
  currentUser: User | null;
  onRefresh: () => void;
  loading: boolean;
}

export function EmployeeWelcomeHeader({
  currentUser,
  onRefresh,
  loading,
}: EmployeeWelcomeHeaderProps) {
  const [greeting, setGreeting] = useState("Welcome back");
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    setFormattedDate(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Column: Greeting and Context */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
              Employee Workspace
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {greeting}, {currentUser?.name || "Team Member"}!
          </h1>
          <p className="text-xs text-slate-500">
            Review today's meeting agendas, track your confirmations, and respond to pending invitations.
          </p>
        </div>

        {/* Right Column: Refresh Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            <span>{loading ? "Syncing..." : "Sync Agendas"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeWelcomeHeader;
