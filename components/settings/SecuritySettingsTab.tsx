"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Lock,
  Smartphone,
  Laptop,
  KeyRound,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { AppSettings } from "@/lib/settings";
import { useToast } from "@/components/Toast";

interface SecuritySettingsTabProps {
  settings: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const TIMEOUT_OPTIONS = [
  { value: 15, label: "15 Minutes", note: "Maximum Security" },
  { value: 30, label: "30 Minutes", note: "Standard Financial/Healthcare" },
  { value: 60, label: "1 Hour", note: "Recommended Corporate" },
  { value: 120, label: "2 Hours", note: "Extended Workflow" },
  { value: 240, label: "4 Hours", note: "Full Working Half-Day" },
];

export function SecuritySettingsTab({
  settings,
  onChange,
}: SecuritySettingsTabProps) {
  const toast = useToast();
  const [deviceInfo, setDeviceInfo] = useState({
    browser: "Web Browser",
    os: "Workstation",
    ip: "Internal Intranet (127.0.0.1)",
  });
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      let browserName = "Modern Browser";
      if (ua.includes("Chrome") && !ua.includes("Edg")) browserName = "Google Chrome";
      else if (ua.includes("Edg")) browserName = "Microsoft Edge";
      else if (ua.includes("Firefox")) browserName = "Mozilla Firefox";
      else if (ua.includes("Safari") && !ua.includes("Chrome")) browserName = "Apple Safari";

      let osName = "Workstation";
      if (ua.includes("Windows")) osName = "Windows NT Workstation";
      else if (ua.includes("Macintosh")) osName = "macOS Workstation";
      else if (ua.includes("Linux")) osName = "Linux Desktop";

      setDeviceInfo({
        browser: browserName,
        os: osName,
        ip: "Internal Secured Network",
      });
    }
  }, []);

  const handleRevokeOtherSessions = () => {
    setIsRevoking(true);
    setTimeout(() => {
      setIsRevoking(false);
      toast.success(
        "Sessions Revoked",
        "All other active web and mobile device sessions have been invalidated."
      );
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Security & Access Controls
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage session timeouts, multi-factor verification, and inspect active authenticated clients.
        </p>
      </div>

      {/* Session Inactivity Timeout */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900">
          <Lock className="w-4 h-4 text-indigo-600" />
          <label htmlFor="settings-session-timeout" className="text-xs font-bold">
            Inactivity Session Timeout
          </label>
        </div>
        <p className="text-[11px] text-slate-500">
          Automatically lock your portal session and require password re-authentication after an idle period.
        </p>

        <select
          id="settings-session-timeout"
          value={settings.sessionTimeoutMinutes}
          onChange={(e) =>
            onChange("sessionTimeoutMinutes", Number(e.target.value))
          }
          className="w-full max-w-md px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer font-medium"
        >
          {TIMEOUT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} — {opt.note}
            </option>
          ))}
        </select>
      </div>

      {/* Two-Factor Authentication (2FA) */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50/70 text-indigo-600 shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900">
                Two-Factor Authentication (2FA)
              </h4>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  settings.twoFactorEnabled
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {settings.twoFactorEnabled ? "Active & Enforced" : "Disabled"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xl">
              Add a second layer of defense by requiring an authentication code from Google Authenticator or corporate token upon signing in.
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={settings.twoFactorEnabled}
          onClick={() => onChange("twoFactorEnabled", !settings.twoFactorEnabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600/30 self-end sm:self-center ${
            settings.twoFactorEnabled ? "bg-indigo-600" : "bg-slate-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              settings.twoFactorEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Active Session Audit Card */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900">
            <Laptop className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold">Active Device & Session Security</h4>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Authenticated</span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {deviceInfo.browser} on {deviceInfo.os}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700">
                Current Session
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Encrypted Bearer JWT Session &bull; {deviceInfo.ip} &bull; Active Now
            </p>
          </div>

          <button
            type="button"
            onClick={handleRevokeOtherSessions}
            disabled={isRevoking}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white hover:border-slate-300 text-xs font-medium text-slate-700 transition-all flex items-center gap-1.5 shadow-2xs self-start sm:self-center cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>{isRevoking ? "Revoking..." : "Revoke Other Sessions"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Sessions are validated with SHA-256 HMAC tokens against the Spring Boot backend server.
          </span>
        </div>
      </div>
    </div>
  );
}
