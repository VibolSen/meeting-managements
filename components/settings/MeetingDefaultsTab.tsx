"use client";

import React, { useState } from "react";
import {
  CalendarClock,
  Clock,
  ShieldAlert,
  Boxes,
  Plus,
  X,
  Check,
} from "lucide-react";
import { AppSettings } from "@/lib/settings";

interface MeetingDefaultsTabProps {
  settings: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const DURATION_PRESETS = [
  { value: 15, label: "15 min", description: "Quick standup & sync" },
  { value: 30, label: "30 min", description: "Standard meeting (Default)" },
  { value: 45, label: "45 min", description: "In-depth review" },
  { value: 60, label: "60 min", description: "Comprehensive briefing" },
  { value: 90, label: "90 min", description: "Executive workshop" },
];

const BUFFER_PRESETS = [
  { value: 0, label: "No Buffer", description: "Back-to-back room scheduling" },
  { value: 5, label: "5 minutes", description: "Recommended for quick turnaround" },
  { value: 10, label: "10 minutes", description: "Standard room reset & sanitation" },
  { value: 15, label: "15 minutes", description: "Large boardroom AV teardown" },
];

const SUGGESTED_EQUIPMENT = [
  "Projector",
  "Whiteboard & Markers",
  "Conference Speakerphone",
  "4K Video Bar",
  "HDMI & USB-C Adapters",
  "Wireless Presentation Clicker",
];

export function MeetingDefaultsTab({
  settings,
  onChange,
}: MeetingDefaultsTabProps) {
  const [customMaterialInput, setCustomMaterialInput] = useState("");

  const toggleMaterial = (item: string) => {
    const current = settings.defaultMaterials || [];
    if (current.includes(item)) {
      onChange(
        "defaultMaterials",
        current.filter((m) => m !== item)
      );
    } else {
      onChange("defaultMaterials", [...current, item]);
    }
  };

  const addCustomMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customMaterialInput.trim();
    if (!trimmed) return;
    const current = settings.defaultMaterials || [];
    if (!current.includes(trimmed)) {
      onChange("defaultMaterials", [...current, trimmed]);
    }
    setCustomMaterialInput("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Meeting & Scheduling Defaults
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Pre-populate standard booking durations, safety buffers, and required room amenities.
        </p>
      </div>

      {/* Default Duration Selector */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900">
          <Clock className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold">Default Meeting Duration</h4>
        </div>
        <p className="text-[11px] text-slate-500">
          Pre-selected meeting length when opening the calendar reservation wizard.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {DURATION_PRESETS.map((preset) => {
            const isSelected = settings.defaultDurationMinutes === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange("defaultDurationMinutes", preset.value)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 text-slate-900"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{preset.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {preset.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-2 text-indigo-600">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Buffer Duration */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900">
          <CalendarClock className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold">Turnaround Buffer Time</h4>
        </div>
        <p className="text-[11px] text-slate-500">
          Automatically inject a padding gap between meetings for sanitization, equipment reset, and room ventilation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {BUFFER_PRESETS.map((buf) => {
            const isSelected = settings.bufferTimeMinutes === buf.value;
            return (
              <button
                key={buf.value}
                type="button"
                onClick={() => onChange("bufferTimeMinutes", buf.value)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 text-slate-900"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-900">{buf.label}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">{buf.description}</p>
                </div>
                {isSelected && (
                  <div className="mt-2 text-indigo-600">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto Conflict Detection Toggle */}
      <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900">
                Real-Time Schedule Clash Detection
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                Proactive
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Instantly warn organizers when an invited attendee or chosen room already has an overlapping commitment.
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={settings.autoDetectConflicts}
          onClick={() => onChange("autoDetectConflicts", !settings.autoDetectConflicts)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600/30 ${
            settings.autoDetectConflicts ? "bg-indigo-600" : "bg-slate-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              settings.autoDetectConflicts ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Default Materials Checklist */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Boxes className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold">Standard Meeting Equipment & Supplies</h4>
        </div>
        <p className="text-[11px] text-slate-500">
          Selected items will be automatically checked when creating new room bookings.
        </p>

        {/* Existing / Pre-selected tags */}
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_EQUIPMENT.map((item) => {
            const isChecked = (settings.defaultMaterials || []).includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleMaterial(item)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isChecked
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold shadow-2xs"
                    : "bg-slate-50/70 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                    isChecked
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span>{item}</span>
              </button>
            );
          })}

          {/* Any custom items added by user that are not in SUGGESTED_EQUIPMENT */}
          {(settings.defaultMaterials || [])
            .filter((m) => !SUGGESTED_EQUIPMENT.includes(m))
            .map((customItem) => (
              <span
                key={customItem}
                className="px-3 py-1.5 rounded-xl text-xs font-medium border bg-indigo-50 border-indigo-200 text-indigo-700 flex items-center gap-1.5"
              >
                <span>{customItem}</span>
                <button
                  type="button"
                  onClick={() => toggleMaterial(customItem)}
                  className="hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
        </div>

        {/* Custom equipment input */}
        <form onSubmit={addCustomMaterial} className="flex gap-2 max-w-md pt-1">
          <input
            type="text"
            placeholder="Add custom item (e.g., Wireless Mic)"
            value={customMaterialInput}
            onChange={(e) => setCustomMaterialInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!customMaterialInput.trim()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>
    </div>
  );
}
