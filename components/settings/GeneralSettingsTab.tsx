"use client";

import React from "react";
import { Globe, Calendar, Clock, Layout, Building2, Mail, Image as ImageIcon, Sparkles } from "lucide-react";
import { AppSettings } from "@/lib/settings";

interface GeneralSettingsTabProps {
  settings: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  systemSettings?: Record<string, string>;
  onSystemSettingChange?: (key: string, value: string) => void;
  isAdmin?: boolean;
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

export function GeneralSettingsTab({
  settings,
  onChange,
  systemSettings = {},
  onSystemSettingChange,
  isAdmin = false,
}: GeneralSettingsTabProps) {
  const getBrandingVal = (key: string, def: string) => systemSettings[key] || def;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* System Branding & Organization (Admin Only) */}
      {isAdmin && (
        <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">System Identity & Branding</h4>
                <p className="text-[11px] text-slate-500">
                  Global branding displayed across navigation headers, titles, and notification alerts
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              GLOBAL BRANDING
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* App Name */}
            <div>
              <label htmlFor="settings-app-name" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Application Name
              </label>
              <input
                id="settings-app-name"
                type="text"
                value={getBrandingVal("branding.app_name", "Meeting Management System")}
                onChange={(e) =>
                  onSystemSettingChange?.("branding.app_name", e.target.value)
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
                placeholder="e.g. Enterprise Meeting Management System"
              />
            </div>

            {/* Organization Name */}
            <div>
              <label htmlFor="settings-org-name" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Organization / Company Name
              </label>
              <input
                id="settings-org-name"
                type="text"
                value={getBrandingVal("branding.organization_name", "Enterprise Workspace")}
                onChange={(e) =>
                  onSystemSettingChange?.("branding.organization_name", e.target.value)
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
                placeholder="e.g. Acme Corporation"
              />
            </div>

            {/* Support Email */}
            <div>
              <label htmlFor="settings-support-email" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Helpdesk & Support Contact Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="settings-support-email"
                  type="email"
                  value={getBrandingVal("branding.support_email", "support@workspace.internal")}
                  onChange={(e) =>
                    onSystemSettingChange?.("branding.support_email", e.target.value)
                  }
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
                  placeholder="support@company.com"
                />
              </div>
            </div>

            {/* Logo URL */}
            <div>
              <label htmlFor="settings-logo-url" className="block text-[11px] font-semibold text-slate-700 mb-1">
                Header Logo Path / Icon URL
              </label>
              <div className="relative">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="settings-logo-url"
                  type="text"
                  value={getBrandingVal("branding.logo_url", "/default logo/meeting-time.svg")}
                  onChange={(e) =>
                    onSystemSettingChange?.("branding.logo_url", e.target.value)
                  }
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
                  placeholder="/default logo/meeting-time.svg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regional & Display Preferences Header */}
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
            Preview: {settings.dateFormat === "YYYY-MM-DD" ? "2026-10-05" : settings.dateFormat === "DD/MM/YYYY" ? "05/10/2026" : "10/05/2026"}
          </p>
          <select
            id="settings-dateformat"
            value={settings.dateFormat}
            onChange={(e) =>
              onChange("dateFormat", e.target.value as AppSettings["dateFormat"])
            }
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer font-medium"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard: 2026-10-05)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (UK / Europe: 05/10/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (US format: 10/05/2026)</option>
          </select>
        </div>

        {/* Time Format */}
        <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold">Time Display</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Choose between standard 24-hour notation and 12-hour AM/PM.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => onChange("timeFormat", "24h")}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                settings.timeFormat === "24h"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              24-Hour (14:30)
            </button>
            <button
              type="button"
              onClick={() => onChange("timeFormat", "12h")}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                settings.timeFormat === "12h"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              12-Hour (2:30 PM)
            </button>
          </div>
        </div>

        {/* Week Start Day */}
        <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900">
            <Layout className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold">First Day of Week</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Determines the first column displayed in the calendar matrix.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => onChange("weekStart", "monday")}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                settings.weekStart === "monday"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Monday
            </button>
            <button
              type="button"
              onClick={() => onChange("weekStart", "sunday")}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                settings.weekStart === "sunday"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Sunday
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
