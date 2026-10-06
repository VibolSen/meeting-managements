"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Globe,
  Bell,
  CalendarClock,
  ShieldAlert,
  KeyRound,
  Sparkles,
  ClipboardList,
  MessageSquareCode,
  ShieldCheck,
} from "lucide-react";
import {
  AppSettings,
  DEFAULT_SETTINGS,
  getStoredSettings,
  setStoredSettings,
  resetStoredSettings,
} from "@/lib/settings";
import { api, SystemSettingItem } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { SettingsHeader } from "./SettingsHeader";
import { GeneralSettingsTab } from "./GeneralSettingsTab";
import { NotificationSettingsTab } from "./NotificationSettingsTab";
import { MeetingDefaultsTab } from "./MeetingDefaultsTab";
import { SystemPoliciesTab } from "./SystemPoliciesTab";
import { SecuritySettingsTab } from "./SecuritySettingsTab";
import { RolePermissionsTab } from "./RolePermissionsTab";
import { AlertTemplateEditor } from "./AlertTemplateEditor";
import { AuditLogView } from "@/components/audit/AuditLogView";

interface SettingsViewProps {
  role: "ADMIN" | "ORGANIZER" | "EMPLOYEE";
}

type TabKey =
  | "general"
  | "notifications"
  | "meetings"
  | "permissions"
  | "policies"
  | "security"
  | "audit"
  | "templates";

export function SettingsView({ role }: SettingsViewProps) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  // Local storage display preferences
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Backend dynamic system settings (Admin & public)
  const [systemSettings, setSystemSettings] = useState<Record<string, string>>({});
  const [savedSystemSettings, setSavedSystemSettings] = useState<Record<string, string>>({});

  const [isSaving, setIsSaving] = useState(false);

  // Fetch backend dynamic configurations
  const fetchBackendSettings = useCallback(async () => {
    try {
      const items: SystemSettingItem[] =
        role === "ADMIN"
          ? await api.systemSettings.getAll()
          : await api.systemSettings.getPublic();

      const map: Record<string, string> = {};
      items.forEach((item) => {
        map[item.settingKey] = item.settingValue;
      });

      setSystemSettings(map);
      setSavedSystemSettings(map);
    } catch (err) {
      console.error("Failed to load backend system settings:", err);
    }
  }, [role]);

  // Initialize from client storage, backend API, and query parameters
  useEffect(() => {
    const loaded = getStoredSettings();
    setSettings(loaded);
    setSavedSettings(loaded);
    fetchBackendSettings().finally(() => setMounted(true));

    const tabParam = searchParams.get("tab") as TabKey | null;
    if (
      tabParam &&
      [
        "general",
        "notifications",
        "meetings",
        "permissions",
        "policies",
        "security",
        "audit",
        "templates",
      ].includes(tabParam)
    ) {
      if (
        tabParam === "audit" ||
        tabParam === "policies" ||
        tabParam === "templates" ||
        tabParam === "permissions"
      ) {
        if (role === "ADMIN") {
          setActiveTab(tabParam);
        }
      } else {
        setActiveTab(tabParam);
      }
    }
  }, [searchParams, role, fetchBackendSettings]);

  const isDirty = useMemo(() => {
    const localDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);
    const backendDirty =
      JSON.stringify(systemSettings) !== JSON.stringify(savedSystemSettings);
    return localDirty || backendDirty;
  }, [settings, savedSettings, systemSettings, savedSystemSettings]);

  const handleSettingChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSystemSettingChange = (key: string, value: string) => {
    setSystemSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Save local browser preferences
      setStoredSettings(settings);
      setSavedSettings(settings);

      // 2. Save backend dynamic system settings if Admin
      if (role === "ADMIN") {
        const updates = Object.entries(systemSettings)
          .filter(([k, v]) => v !== savedSystemSettings[k])
          .map(([settingKey, settingValue]) => ({ settingKey, settingValue }));

        if (updates.length > 0) {
          await api.systemSettings.batchUpdate(updates);
          setSavedSystemSettings(systemSettings);
        }
      }

      // 3. Dispatch global synchronization event
      window.dispatchEvent(new CustomEvent("system-settings-updated"));

      toast.success(
        "Settings Saved",
        "Workspace preferences and system governance policies have been successfully updated."
      );
    } catch (err: any) {
      toast.error(
        "Save Failed",
        err?.message || "An error occurred while saving dynamic configurations."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      if (role === "ADMIN") {
        await api.systemSettings.resetToDefaults();
        await fetchBackendSettings();
      }

      const defaults = resetStoredSettings();
      setSettings(defaults);
      setSavedSettings(defaults);

      window.dispatchEvent(new CustomEvent("system-settings-updated"));
      toast.info(
        "Settings Reset",
        "Restored standard system default configurations."
      );
    } catch (err: any) {
      toast.error(
        "Reset Failed",
        err?.message || "Failed to reset settings to factory defaults."
      );
    }
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
        label: "General & Branding",
        description: "Application name, logo, timezones, layout",
        icon: Globe,
      },
      {
        key: "notifications",
        label: "Notifications & Alerts",
        description: "In-app triggers, Telegram bot, lead times",
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
        key: "permissions",
        label: "Role & Permissions",
        description: "Employee & Organizer booking privileges",
        icon: ShieldCheck,
        badge: "Admin",
      });
      list.push({
        key: "policies",
        label: "System Policies",
        description: "Booking horizons, capacity thresholds, hours",
        icon: ShieldAlert,
        badge: "Admin",
      });
      list.push({
        key: "templates",
        label: "Alert Templates",
        description: "Telegram & system message templates",
        icon: MessageSquareCode,
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
        showActions={activeTab !== "audit" && activeTab !== "templates"}
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
          <div className="hidden md:flex mt-6 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-linear-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/40 dark:to-purple-950/30 items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Live Dynamic Governance
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Settings update directly in MySQL and enforce real-time business logic across all calendars, bookings, and alerts.
              </p>
            </div>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="md:col-span-8 lg:col-span-9 bg-white/50 rounded-2xl">
          {activeTab === "general" && (
            <GeneralSettingsTab
              settings={settings}
              onChange={handleSettingChange}
              systemSettings={systemSettings}
              onSystemSettingChange={handleSystemSettingChange}
              isAdmin={role === "ADMIN"}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationSettingsTab
              settings={settings}
              onChange={handleSettingChange}
              systemSettings={systemSettings}
              onSystemSettingChange={handleSystemSettingChange}
              isAdmin={role === "ADMIN"}
            />
          )}

          {activeTab === "meetings" && (
            <MeetingDefaultsTab
              settings={settings}
              onChange={handleSettingChange}
              systemSettings={systemSettings}
              onSystemSettingChange={handleSystemSettingChange}
            />
          )}

          {activeTab === "permissions" && role === "ADMIN" && (
            <RolePermissionsTab
              systemSettings={systemSettings}
              onSettingChange={handleSystemSettingChange}
            />
          )}

          {activeTab === "policies" && role === "ADMIN" && (
            <SystemPoliciesTab
              settings={settings}
              onChange={handleSettingChange}
              systemSettings={systemSettings}
              onSystemSettingChange={handleSystemSettingChange}
            />
          )}

          {activeTab === "templates" && role === "ADMIN" && (
            <AlertTemplateEditor />
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
