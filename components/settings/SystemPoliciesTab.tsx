"use client";

import React from "react";
import {
  ShieldAlert,
  Users,
  CalendarDays,
  Clock,
  Info,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { AppSettings } from "@/lib/settings";

interface SystemPoliciesTabProps {
  settings: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const ADVANCE_DAYS_OPTIONS = [
  { value: 14, label: "2 Weeks (14 Days)" },
  { value: 30, label: "1 Month (30 Days)" },
  { value: 60, label: "2 Months (60 Days - Recommended)" },
  { value: 90, label: "1 Quarter (90 Days)" },
  { value: 180, label: "6 Months (180 Days)" },
];

export function SystemPoliciesTab({
  settings,
  onChange,
}: SystemPoliciesTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Admin Notice Header */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900">
              Enterprise Governance & Global Policies
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-600 text-white">
              ADMIN ONLY
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            These rules enforce global boundaries across all departmental room reservations, advance scheduling limits, and supervisor approval thresholds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Boardroom Approval Threshold */}
        <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900">
            <Users className="w-4 h-4 text-indigo-600" />
            <label htmlFor="settings-capacity-threshold" className="text-xs font-bold">
              Boardroom Approval Threshold
            </label>
          </div>
          <p className="text-[11px] text-slate-500">
            Rooms with a capacity equal to or greater than this number require mandatory Administrator sign-off.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <input
              id="settings-capacity-threshold"
              type="range"
              min="5"
              max="100"
              step="5"
              value={settings.approvalThresholdCapacity}
              onChange={(e) =>
                onChange("approvalThresholdCapacity", Number(e.target.value))
              }
              className="flex-1 accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="w-16 px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 text-indigo-700 font-bold text-xs text-center">
              {settings.approvalThresholdCapacity}+ pax
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>5 attendees</span>
            <span>100 attendees</span>
          </div>
        </div>

        {/* Max Advance Booking Window */}
        <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900">
            <CalendarDays className="w-4 h-4 text-indigo-600" />
            <label htmlFor="settings-advance-days" className="text-xs font-bold">
              Max Advance Booking Horizon
            </label>
          </div>
          <p className="text-[11px] text-slate-500">
            Prevent speculative schedule squatting by capping how far in the future slots can be reserved.
          </p>

          <select
            id="settings-advance-days"
            value={settings.maxAdvanceBookingDays}
            onChange={(e) =>
              onChange("maxAdvanceBookingDays", Number(e.target.value))
            }
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer font-medium"
          >
            {ADVANCE_DAYS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <p className="text-[11px] text-slate-400">
            Employees will see calendar slots beyond {settings.maxAdvanceBookingDays} days disabled.
          </p>
        </div>
      </div>

      {/* Facility Working Hours */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Clock className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold">Facility Standard Operating Hours</h4>
        </div>
        <p className="text-[11px] text-slate-500">
          Bookings outside standard operating hours will require facility security clearance and will display an off-hours warning banner.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div>
            <label htmlFor="settings-hours-start" className="block text-[11px] font-semibold text-slate-700 mb-1">
              Opening Time (Start)
            </label>
            <input
              id="settings-hours-start"
              type="time"
              value={settings.workingHoursStart}
              onChange={(e) => onChange("workingHoursStart", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label htmlFor="settings-hours-end" className="block text-[11px] font-semibold text-slate-700 mb-1">
              Closing Time (End)
            </label>
            <input
              id="settings-hours-end"
              type="time"
              value={settings.workingHoursEnd}
              onChange={(e) => onChange("workingHoursEnd", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Active Operating Hours: <strong>{settings.workingHoursStart}</strong> to{" "}
            <strong>{settings.workingHoursEnd}</strong> (Total 10 hours daily).
          </span>
        </div>
      </div>
    </div>
  );
}
