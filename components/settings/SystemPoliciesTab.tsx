"use client";

import React from "react";
import {
  ShieldAlert,
  Users,
  CalendarDays,
  Clock,
  UserCheck,
  CalendarRange,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { AppSettings } from "@/lib/settings";

interface SystemPoliciesTabProps {
  settings?: AppSettings;
  onChange?: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  systemSettings?: Record<string, string>;
  onSystemSettingChange?: (key: string, value: string) => void;
}

const ADVANCE_DAYS_OPTIONS = [
  { value: "14", label: "2 Weeks (14 Days)" },
  { value: "30", label: "1 Month (30 Days)" },
  { value: "60", label: "2 Months (60 Days - Recommended)" },
  { value: "90", label: "1 Quarter (90 Days)" },
  { value: "180", label: "6 Months (180 Days)" },
];

export function SystemPoliciesTab({
  settings,
  onChange,
  systemSettings = {},
  onSystemSettingChange,
}: SystemPoliciesTabProps) {
  // Helper to read setting from systemSettings or legacy settings
  const getValue = (key: string, legacyVal: any, def: string): string => {
    if (systemSettings[key] !== undefined) return systemSettings[key];
    if (legacyVal !== undefined) return String(legacyVal);
    return def;
  };

  const update = (key: string, legacyKey: keyof AppSettings | null, val: string) => {
    if (onSystemSettingChange) {
      onSystemSettingChange(key, val);
    }
    if (onChange && legacyKey) {
      if (typeof settings?.[legacyKey] === "number") {
        onChange(legacyKey, Number(val) as any);
      } else {
        onChange(legacyKey, val as any);
      }
    }
  };

  const capacityThreshold = Number(
    getValue("booking.approval_threshold_capacity", settings?.approvalThresholdCapacity, "20")
  );
  const maxAdvanceDays = getValue(
    "booking.max_advance_days",
    settings?.maxAdvanceBookingDays,
    "60"
  );
  const hoursStart = getValue(
    "booking.operating_hours_start",
    settings?.workingHoursStart,
    "08:00"
  );
  const hoursEnd = getValue(
    "booking.operating_hours_end",
    settings?.workingHoursEnd,
    "18:00"
  );
  const attendeeMode = getValue(
    "booking.attendee_acceptance_mode",
    undefined,
    "AUTO_ACCEPT"
  );
  const allowWeekend =
    getValue("booking.allow_weekend_booking", undefined, "false") === "true";

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
              Enterprise Governance & Scheduling Policies
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-600 text-white">
              ADMIN ONLY
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            These rules enforce global boundaries across room reservations, attendee invitation confirmation flows, and operating hours.
          </p>
        </div>
      </div>

      {/* Attendee Acceptance Mode Policy */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900">
          <UserCheck className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold">Attendee Invitation Acceptance Mode</h4>
        </div>
        <p className="text-[11px] text-slate-500">
          Determine whether invited attendees are automatically confirmed to attend, or whether they must manually respond (RSVP).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Auto Accept Option */}
          <div
            onClick={() =>
              update("booking.attendee_acceptance_mode", null, "AUTO_ACCEPT")
            }
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              attendeeMode === "AUTO_ACCEPT"
                ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/10 shadow-xs"
                : "border-slate-200/90 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Auto-Accept (Mandatory Attendance)
              </span>
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  attendeeMode === "AUTO_ACCEPT"
                    ? "border-indigo-600 bg-indigo-600"
                    : "border-slate-300"
                }`}
              >
                {attendeeMode === "AUTO_ACCEPT" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Recommended: Participants are immediately confirmed upon invitation. No awaiting response needed.
            </p>
          </div>

          {/* RSVP Required Option */}
          <div
            onClick={() =>
              update("booking.attendee_acceptance_mode", null, "RSVP_REQUIRED")
            }
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              attendeeMode === "RSVP_REQUIRED"
                ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/10 shadow-xs"
                : "border-slate-200/90 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                RSVP Required (Manual Confirmation)
              </span>
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  attendeeMode === "RSVP_REQUIRED"
                    ? "border-indigo-600 bg-indigo-600"
                    : "border-slate-300"
                }`}
              >
                {attendeeMode === "RSVP_REQUIRED" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Participants receive notifications in "Awaiting Response" status and must manually click Accept or Decline.
            </p>
          </div>
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
              value={capacityThreshold}
              onChange={(e) =>
                update(
                  "booking.approval_threshold_capacity",
                  "approvalThresholdCapacity",
                  e.target.value
                )
              }
              className="flex-1 accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="w-16 px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 text-indigo-700 font-bold text-xs text-center">
              {capacityThreshold}+ pax
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
            value={maxAdvanceDays}
            onChange={(e) =>
              update(
                "booking.max_advance_days",
                "maxAdvanceBookingDays",
                e.target.value
              )
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
            Employees will see reservation attempts beyond {maxAdvanceDays} days rejected.
          </p>
        </div>
      </div>

      {/* Facility Working Hours & Weekend Policy */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold">Facility Standard Operating Hours</h4>
          </div>

          {/* Weekend Toggle */}
          <div className="flex items-center gap-2">
            <label htmlFor="weekend-toggle" className="text-xs text-slate-700 font-medium cursor-pointer">
              Allow Weekend Bookings
            </label>
            <button
              id="weekend-toggle"
              type="button"
              role="switch"
              aria-checked={allowWeekend}
              onClick={() =>
                update(
                  "booking.allow_weekend_booking",
                  null,
                  allowWeekend ? "false" : "true"
                )
              }
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                allowWeekend ? "bg-indigo-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  allowWeekend ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          Bookings outside standard operating hours will be validated and rejected by backend policy enforcement.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div>
            <label htmlFor="settings-hours-start" className="block text-[11px] font-semibold text-slate-700 mb-1">
              Opening Time (Start)
            </label>
            <input
              id="settings-hours-start"
              type="time"
              value={hoursStart}
              onChange={(e) =>
                update(
                  "booking.operating_hours_start",
                  "workingHoursStart",
                  e.target.value
                )
              }
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
              value={hoursEnd}
              onChange={(e) =>
                update(
                  "booking.operating_hours_end",
                  "workingHoursEnd",
                  e.target.value
                )
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Active Operating Hours: <strong>{hoursStart}</strong> to{" "}
            <strong>{hoursEnd}</strong> ({allowWeekend ? "Including Weekends" : "Weekdays Only"}).
          </span>
        </div>
      </div>
    </div>
  );
}
