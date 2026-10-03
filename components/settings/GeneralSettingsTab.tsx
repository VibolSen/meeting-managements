"use client";

import React from "react";
import { Globe, Calendar, Clock, Layout } from "lucide-react";
import { AppSettings } from "@/lib/settings";

interface GeneralSettingsTabProps {
  settings: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const TIMEZONES = [
  { value: "Asia/Phnom_Penh", label: "Phnom Penh (UTC+07:00)" },
  { value: "Asia/Bangkok", label: "Bangkok, Hanoi, Jakarta (UTC+07:00)" },
  { value: "Asia/Singapore", label: "Singapore, Kuala Lumpur (UTC+08:00)" },
  { value: "Asia/Tokyo", label: "Tokyo, Seoul (UTC+09:00)" },
  { value: "UTC", label: "Coordinated Universal Time (UTC+00:00)" },
  { value: "Europe/London", label: "London, Dublin (UTC+01:00 / BST)" },
  { value: "Europe/Paris", label: "Paris, Berlin, Rome (UTC+02:00 / CEST)" },
  { value: "America/New_York", label: "Eastern Time (US & Canada, UTC-04:00 / EDT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada, UTC-07:00 / PDT)" },
];

export function GeneralSettingsTab({ settings, onChange }: GeneralSettingsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Regional & Display Preferences
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure how dates, times, and schedules are formatted across your workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timezone Preference */}
        <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900">
            <Globe className="w-4 h-4 text-indigo-600" />
            <label htmlFor="settings-timezone" className="text-xs font-bold">
              Timezone
            </label>
          </div>
          <p className="text-[11px] text-slate-500">
            All meeting start and end times will be calculated in this zone.
          </p>
          <select
            id="settings-timezone"
            value={settings.timezone}
            onChange={(e) => onChange("timezone", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer font-medium"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Format */}
        <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <label htmlFor="settings-dateformat" className="text-xs font-bold">
              Date Format
            </label>
          </div>
          <p className="text-[11px] text-slate-500">
            Preview: {settings.dateFormat === "YYYY-MM-DD" ? "2026-10-03" : settings.dateFormat === "DD/MM/YYYY" ? "03/10/2026" : "10/03/2026"}
          </p>
          <select
            id="settings-dateformat"
            value={settings.dateFormat}
            onChange={(e) =>
              onChange("dateFormat", e.target.value as AppSettings["dateFormat"])
            }
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer font-medium"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard: 2026-10-03)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (UK / Europe: 03/10/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (US format: 10/03/2026)</option>
          </select>
        </div>

        {/* Time Format */}
        <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold">Time Display</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Choose between standard 24-hour military notation and 12-hour AM/PM.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => onChange("timeFormat", "24h")}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                settings.timeFormat === "24h"
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs"
                  : "bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>24-Hour (14:30)</span>
            </button>
            <button
              type="button"
              onClick={() => onChange("timeFormat", "12h")}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                settings.timeFormat === "12h"
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs"
                  : "bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>12-Hour (02:30 PM)</span>
            </button>
          </div>
        </div>

        {/* Calendar View Defaults */}
        <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900">
            <Layout className="w-4 h-4 text-indigo-600" />
            <label htmlFor="settings-calendar-view" className="text-xs font-bold">
              Default Calendar View
            </label>
          </div>
          <p className="text-[11px] text-slate-500">
            First Day: {settings.weekStart === "monday" ? "Monday" : "Sunday"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <select
              id="settings-calendar-view"
              value={settings.defaultCalendarView}
              onChange={(e) =>
                onChange(
                  "defaultCalendarView",
                  e.target.value as AppSettings["defaultCalendarView"]
                )
              }
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer font-medium"
            >
              <option value="week">Week Matrix</option>
              <option value="day">Day Grid</option>
              <option value="agenda">Agenda List</option>
            </select>

            <select
              value={settings.weekStart}
              onChange={(e) =>
                onChange("weekStart", e.target.value as AppSettings["weekStart"])
              }
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer font-medium"
              aria-label="First day of the week"
            >
              <option value="monday">Week starts Monday</option>
              <option value="sunday">Week starts Sunday</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
