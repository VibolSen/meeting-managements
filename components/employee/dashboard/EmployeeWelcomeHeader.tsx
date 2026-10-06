"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, api } from "@/lib/api";
import { Calendar, CalendarPlus, RefreshCw, Lock, Eye } from "lucide-react";

interface EmployeeWelcomeHeaderProps {
  currentUser: User | null;
  onRefresh: () => void;
  loading: boolean;
  onOpenBooking?: () => void;
}

export function EmployeeWelcomeHeader({
  currentUser,
  onRefresh,
  loading,
  onOpenBooking,
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

  const isViewOnly = currentUser?.bookingAccess === "VIEW_ONLY";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 sm:p-6 shadow-xs">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Column: Greeting and Context */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
              Employee Workspace
            </span>
            {isViewOnly && (
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800/60 flex items-center gap-1">
                <Eye className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>View Only (Probation)</span>
              </span>
            )}
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {greeting}, {currentUser?.name || "Team Member"}!
          </h1>
          <p className="text-xs text-slate-500">
            Review today's meeting agendas, track your confirmations, and respond to pending invitations.
          </p>
        </div>

        {/* Right Column: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenBooking && (
            <button
              type="button"
              onClick={onOpenBooking}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isViewOnly
                  ? "text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300"
                  : "text-white bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
              }`}
              title={
                isViewOnly
                  ? "Your account is in View Only mode (probation staff)"
                  : "Book a new meeting"
              }
            >
              {isViewOnly ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>View Only (Probation)</span>
                </>
              ) : (
                <>
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Book Meeting</span>
                </>
              )}
            </button>
          )}
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
