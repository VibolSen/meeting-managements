"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Globe,
  Bell,
  CalendarClock,
  ShieldAlert,
  KeyRound,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import {
  AppSettings,
  DEFAULT_SETTINGS,
  getStoredSettings,
  setStoredSettings,
  resetStoredSettings,
} from "@/lib/settings";
import { useToast } from "@/components/Toast";
import { SettingsHeader } from "./SettingsHeader";
import { GeneralSettingsTab } from "./GeneralSettingsTab";
import { NotificationSettingsTab } from "./NotificationSettingsTab";
import { MeetingDefaultsTab } from "./MeetingDefaultsTab";
import { SystemPoliciesTab } from "./SystemPoliciesTab";
import { SecuritySettingsTab } from "./SecuritySettingsTab";
import { AuditLogView } from "@/components/audit/AuditLogView";

interface SettingsViewProps {
  role: "ADMIN" | "ORGANIZER" | "EMPLOYEE";
}

type TabKey = "general" | "notifications" | "meetings" | "policies" | "security" | "audit";

export function SettingsView({ role }: SettingsViewProps) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize from client storage and query parameter
  useEffect(() => {
    const loaded = getStoredSettings();
    setSettings(loaded);
    setSavedSettings(loaded);
    setMounted(true);

    const tabParam = searchParams.get("tab") as TabKey | null;
    if (
      tabParam &&
      ["general", "notifications", "meetings", "policies", "security", "audit"].includes(tabParam)
    ) {
      if (tabParam === "audit" || tabParam === "policies") {
        if (role === "ADMIN") {
          setActiveTab(tabParam);
        }
      } else {
        setActiveTab(tabParam);
      }
    }
  }, [searchParams, role]);

  const isDirty = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(savedSettings);
  }, [settings, savedSettings]);

  const handleSettingChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setStoredSettings(settings);
      setSavedSettings(settings);
      setIsSaving(false);
      toast.success(
        "Settings Saved",
        "Your workspace preferences have been successfully updated."
      );
    }, 400);
  };

  const handleReset = () => {
    const defaults = resetStoredSettings();
    setSettings(defaults);
    setSavedSettings(defaults);
    toast.info(
      "Settings Reset",
      "Restored standard system default configurations."
    );
  };

  const tabs = useMemo(() => {
    const list: Array<{
      key: TabKey;
      label: string;
      description: string;
      icon: React.ElementType;
      badge?: string;
    }> = [
      {
        key: "general",
        label: "General & Regional",
        description: "Timezone, date formats, calendar layout",
        icon: Globe,
      },
      {
        key: "notifications",
        label: "Notifications & Alerts",
        description: "In-app triggers, digest frequency, audio",
        icon: Bell,
      },
      {
        key: "meetings",
        label: "Meeting Defaults",
        description: "Durations, buffer times, equipment presets",
        icon: CalendarClock,
      },
    ];

    if (role === "ADMIN") {
      list.push({
        key: "policies",
        label: "System Policies",
        description: "Booking horizons, capacity thresholds",
        icon: ShieldAlert,
        badge: "Admin",
      });
      list.push({
        key: "audit",
        label: "Audit Trail & Logs",
        description: "Immutable compliance & system records",
        icon: ClipboardList,
        badge: "Admin",
      });
    }

    list.push({
      key: "security",
      label: "Security & Access",
      description: "Session timeouts, 2FA, device audit",
      icon: KeyRound,
    });

    return list;
  }, [role]);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="md:col-span-3 h-96 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Save / Reset Controls */}
      <SettingsHeader
        role={role}
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        onReset={handleReset}
        showActions={activeTab !== "audit"}
      />

      {/* Main Settings Body */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Sidebar / Tabs */}
        <aside className="md:col-span-4 lg:col-span-3">
          <nav className="flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-start gap-3 p-3 rounded-2xl text-left transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 border border-indigo-200/80 text-indigo-900 shadow-2xs"
                      : "border border-transparent hover:bg-slate-100/70 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold truncate">
                        {tab.label}
                      </span>
                      {tab.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-indigo-600 text-white">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate hidden md:block mt-0.5">
                      {tab.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Productivity Tip Box */}
          <div className="hidden md:flex mt-6 p-4 rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50/60 to-purple-50/40 items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900">
                Workspace Personalization
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Changes apply seamlessly to your calendar views, invitation cards, and notifications.
              </p>
            </div>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="md:col-span-8 lg:col-span-9 bg-white/50 rounded-2xl">
          {activeTab === "general" && (
            <GeneralSettingsTab settings={settings} onChange={handleSettingChange} />
          )}

          {activeTab === "notifications" && (
            <NotificationSettingsTab
              settings={settings}
              onChange={handleSettingChange}
            />
          )}

          {activeTab === "meetings" && (
            <MeetingDefaultsTab
              settings={settings}
              onChange={handleSettingChange}
            />
          )}

          {activeTab === "policies" && role === "ADMIN" && (
            <SystemPoliciesTab
              settings={settings}
              onChange={handleSettingChange}
            />
          )}

          {activeTab === "security" && (
            <SecuritySettingsTab
              settings={settings}
              onChange={handleSettingChange}
            />
          )}

          {activeTab === "audit" && role === "ADMIN" && (
            <AuditLogView embedded={true} />
          )}
        </main>
      </div>
    </div>
  );
}
