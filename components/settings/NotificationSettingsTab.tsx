"use client";

import React, { useState } from "react";
import {
  Bell,
  Mail,
  Volume2,
  VolumeX,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { AppSettings } from "@/lib/settings";

interface NotificationSettingsTabProps {
  settings: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export function NotificationSettingsTab({
  settings,
  onChange,
}: NotificationSettingsTabProps) {
  const [isPlayingChime, setIsPlayingChime] = useState(false);

  const playChimePreview = () => {
    try {
      setIsPlayingChime(true);
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        setIsPlayingChime(false);
        return;
      }
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1 (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2 (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.22, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);

      setTimeout(() => {
        setIsPlayingChime(false);
      }, 600);
    } catch {
      setIsPlayingChime(false);
    }
  };

  const notificationToggles = [
    {
      key: "notifyNewInvitations" as const,
      icon: CalendarCheck,
      title: "Meeting Invitations",
      description: "Notify immediately when you are invited or assigned to a meeting",
      badge: "Essential",
    },
    {
      key: "notifyMeetingChanges" as const,
      icon: CalendarClock,
      title: "Rescheduled Meetings & Agenda Updates",
      description: "Alert when room assignment, start/end time, or agenda notes change",
      badge: "Real-time",
    },
    {
      key: "notifyCancellations" as const,
      icon: CalendarX,
      title: "Cancellations & Attendee Declines",
      description: "Receive instant updates when a session is revoked or a key participant declines",
      badge: "Real-time",
    },
    {
      key: "notifyReminders" as const,
      icon: Clock,
      title: "15-Minute Advance Reminder",
      description: "Display an in-app banner and trigger sound 15 minutes before your meeting begins",
      badge: "Pre-meeting",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Notification & Alert Rules
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Select which events trigger in-app banners, push alerts, and consolidated emails.
        </p>
      </div>

      {/* In-App Notifications List */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-900">In-App Event Triggers</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Applied immediately</span>
        </div>

        <div className="divide-y divide-slate-100">
          {notificationToggles.map((item) => {
            const Icon = item.icon;
            const isChecked = !!settings[item.key];
            return (
              <div
                key={item.key}
                className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50/70 text-indigo-600 mt-0.5 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">{item.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </div>

                {/* Styled Switch Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isChecked}
                  onClick={() => onChange(item.key, !isChecked as any)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600/30 ${
                    isChecked ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isChecked ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Email Delivery Cadence */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Mail className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold">Email Digest Frequency</h4>
        </div>
        <p className="text-[11px] text-slate-500">
          Control how often meeting summaries and invites are sent to your verified email inbox.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: "instant",
              title: "Instant Updates",
              tag: "Recommended",
              desc: "Immediate email for every booking, reschedule, or room confirmation.",
            },
            {
              id: "daily",
              title: "Daily Digest",
              tag: "08:00 AM",
              desc: "Single consolidated email each morning with your agenda and action items.",
            },
            {
              id: "off",
              title: "Off",
              tag: "In-App Only",
              desc: "No emails. All notices and invitations will appear strictly inside the web app.",
            },
          ].map((opt) => {
            const isSelected = settings.emailDigest === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange("emailDigest", opt.id as any)}
                className={`text-left p-3.5 rounded-xl border transition-all text-xs relative flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/40 text-slate-900 ring-1 ring-indigo-600"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900">{opt.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {opt.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
                </div>
                {isSelected && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-indigo-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Plan</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Audio Alert Settings */}
      <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50/70 text-indigo-600 shrink-0">
            {settings.notificationSound ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Audible Alert Sound</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Play a subtle double chime when urgent invitations or reminder toasts appear on screen.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={playChimePreview}
            disabled={isPlayingChime}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isPlayingChime ? "Playing..." : "Test Chime"}</span>
          </button>

          <button
            type="button"
            role="switch"
            aria-checked={settings.notificationSound}
            onClick={() => onChange("notificationSound", !settings.notificationSound)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600/30 ${
              settings.notificationSound ? "bg-indigo-600" : "bg-slate-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                settings.notificationSound ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
