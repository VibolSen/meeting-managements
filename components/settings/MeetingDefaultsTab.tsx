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
  systemSettings?: Record<string, string>;
  onSystemSettingChange?: (key: string, value: string) => void;
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
  systemSettings = {},
  onSystemSettingChange,
}: MeetingDefaultsTabProps) {
  const [customMaterialInput, setCustomMaterialInput] = useState("");

  const currentDuration = systemSettings["scheduling.default_duration_min"]
    ? Number(systemSettings["scheduling.default_duration_min"])
    : settings.defaultDurationMinutes;

  const currentBuffer = systemSettings["scheduling.room_buffer_min"]
    ? Number(systemSettings["scheduling.room_buffer_min"])
    : settings.bufferTimeMinutes;

  const handleDurationChange = (val: number) => {
    onChange("defaultDurationMinutes", val);
    onSystemSettingChange?.("scheduling.default_duration_min", String(val));
  };

  const handleBufferChange = (val: number) => {
    onChange("bufferTimeMinutes", val);
    onSystemSettingChange?.("scheduling.room_buffer_min", String(val));
  };

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
          Pre-populate standard booking durations, safety buffers, and default room amenities.
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
            const isSelected = currentDuration === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleDurationChange(preset.value)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10 shadow-xs"
                    : "border-slate-200/90 bg-slate-50/40 hover:bg-slate-100/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? "text-indigo-900" : "text-slate-800"
                    }`}
                  >
                    {preset.label}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Safety Buffer Time */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900">
          <CalendarClock className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold">Turnaround Buffer Time</h4>
        </div>
        <p className="text-[11px] text-slate-500">
          Enforce gap between reservations for room air circulation, cleaning, and AV equipment setup.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BUFFER_PRESETS.map((preset) => {
            const isSelected = currentBuffer === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleBufferChange(preset.value)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10 shadow-xs"
                    : "border-slate-200/90 bg-slate-50/40 hover:bg-slate-100/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? "text-indigo-900" : "text-slate-800"
                    }`}
                  >
                    {preset.label}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pre-Selected Equipment & Materials */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900">
            <Boxes className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold">Standard Room Amenities Checklist</h4>
          </div>
          <span className="text-[11px] text-slate-400">
            {(settings.defaultMaterials || []).length} selected
          </span>
        </div>

        <p className="text-[11px] text-slate-500">
          Items checked below will be selected by default when initiating new booking reservations.
        </p>

        {/* Suggested Equipment Tags */}
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_EQUIPMENT.map((item) => {
            const isChecked = (settings.defaultMaterials || []).includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleMaterial(item)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isChecked
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {isChecked ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{item}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Item Form */}
        <form onSubmit={addCustomMaterial} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Add custom required material (e.g. Laser Pointer)..."
            value={customMaterialInput}
            onChange={(e) => setCustomMaterialInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!customMaterialInput.trim()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </form>
      </div>
    </div>
  );
}
