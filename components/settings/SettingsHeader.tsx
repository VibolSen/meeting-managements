"use client";

import React from "react";
import { Settings, Save, RotateCcw, ShieldCheck, Loader2 } from "lucide-react";

interface SettingsHeaderProps {
  role: "ADMIN" | "ORGANIZER" | "EMPLOYEE";
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
  showActions?: boolean;
}

export function SettingsHeader({
  role,
  isDirty,
  isSaving,
  onSave,
  onReset,
  showActions = true,
}: SettingsHeaderProps) {
  const roleBadgeMap = {
    ADMIN: { label: "System Administrator", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    ORGANIZER: { label: "Meeting Organizer", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    EMPLOYEE: { label: "Standard Employee", color: "bg-blue-50 text-blue-700 border-blue-200" },
  };

  const badge = roleBadgeMap[role] || roleBadgeMap.EMPLOYEE;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Settings & Preferences
          </h1>
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${badge.color}`}
          >
            {badge.label}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Manage your regional timezones, notification channels, scheduling presets, and account security.
        </p>
      </div>

      {showActions ? (
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          {/* Reset to default */}
          <button
            type="button"
            onClick={onReset}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>

        {/* Save button with dirty indicator */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !isDirty}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
            isDirty
              ? "bg-indigo-600 hover:bg-indigo-700 text-white ring-2 ring-indigo-600/20"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
              {isDirty && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
              )}
            </>
          )}
        </button>
      </div>
      ) : (
        <div className="self-start sm:self-center">
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            System Records &bull; Immutable Audit Trail
          </span>
        </div>
      )}
    </div>
  );
}
