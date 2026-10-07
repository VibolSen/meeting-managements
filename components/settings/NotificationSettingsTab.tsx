"use client";

import React, { useState, useEffect } from "react";
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
  Send,
  ExternalLink,
  Save,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Bot,
  Radio,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  KeyRound,
  XCircle,
  User as UserIcon,
} from "lucide-react";
import { AppSettings } from "@/lib/settings";
import { useAuth } from "@/lib/auth";
import {
  api,
  TelegramStatus,
  TelegramBotConfig,
  TelegramBotConfigUpdate,
  TelegramValidationResult,
} from "@/lib/api";
import { useToast } from "@/components/Toast";

interface NotificationSettingsTabProps {
  settings: AppSettings;
  onChange: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  systemSettings?: Record<string, string>;
  onSystemSettingChange?: (key: string, value: string) => void;
  isAdmin?: boolean;
}

const PRESET_LEAD_TIMES = [
  { minutes: 5, label: "5 min", badge: "Short" },
  { minutes: 10, label: "10 min", badge: "Default", recommended: true },
  { minutes: 15, label: "15 min", badge: "Standard" },
  { minutes: 30, label: "30 min", badge: "Generous" },
  { minutes: 60, label: "1 hour", badge: "Early" },
];

export function NotificationSettingsTab({
  settings,
  onChange,
  systemSettings = {},
  onSystemSettingChange,
  isAdmin = false,
}: NotificationSettingsTabProps) {
  const toast = useToast();
  const { user, setUser } = useAuth();
  const effectiveIsAdmin = isAdmin || user?.role === "ADMIN";

  // Telegram General Status
  const [botStatus, setBotStatus] = useState<TelegramStatus | null>(null);

  // Admin Server Bot Gateway State
  const [adminConfig, setAdminConfig] = useState<TelegramBotConfig | null>(null);
  const [adminTokenInput, setAdminTokenInput] = useState<string>("");
  const [showToken, setShowToken] = useState<boolean>(false);
  const [adminBotUsername, setAdminBotUsername] = useState<string>("MMS_Meeting_Alert_Bot");
  const [adminDefaultChatId, setAdminDefaultChatId] = useState<string>("1035574371");
  const [adminBotEnabled, setAdminBotEnabled] = useState<boolean>(true);
  const [adminLeadMinutes, setAdminLeadMinutes] = useState<number>(10);
  const [isValidatingToken, setIsValidatingToken] = useState<boolean>(false);
  const [isSavingAdminConfig, setIsSavingAdminConfig] = useState<boolean>(false);
  const [isSendingAdminBroadcastTest, setIsSendingAdminBroadcastTest] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<TelegramValidationResult | null>(null);

  // User-Level Telegram State
  const [telegramChatId, setTelegramChatId] = useState<string>("");
  const [telegramUsername, setTelegramUsername] = useState<string>("");
  const [telegramNotificationsEnabled, setTelegramNotificationsEnabled] = useState<boolean>(true);
  const [telegramReminderMinutes, setTelegramReminderMinutes] = useState<number>(10);
  const [isCustomMinutes, setIsCustomMinutes] = useState<boolean>(false);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>("10");
  const [isSavingTelegram, setIsSavingTelegram] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [isPlayingChime, setIsPlayingChime] = useState<boolean>(false);

  // Load Bot Status & Admin Gateway Config
  useEffect(() => {
    api.telegram.getStatus().then((status) => {
      setBotStatus(status);
    }).catch(() => null);

    if (effectiveIsAdmin) {
      api.telegram.getConfig().then((cfg) => {
        setAdminConfig(cfg);
        setAdminBotUsername(cfg.botUsername || "MMS_Meeting_Alert_Bot");
        setAdminDefaultChatId(cfg.defaultChatId || "1035574371");
        setAdminBotEnabled(cfg.botEnabled ?? true);
        setAdminLeadMinutes(cfg.defaultReminderMinutes || 10);
      }).catch(() => null);
    }
  }, [effectiveIsAdmin]);

  // Load Current User Telegram Preferences
  useEffect(() => {
    if (user) {
      const chatId = user.telegramChatId || "";
      const username = user.telegramUsername || "";
      const mins = user.telegramReminderMinutes ?? 10;
      const enabled = user.telegramNotificationsEnabled ?? true;

      setTelegramChatId(chatId);
      setTelegramUsername(username);
      setTelegramReminderMinutes(mins);
      setTelegramNotificationsEnabled(enabled);

      const isPreset = PRESET_LEAD_TIMES.some((p) => p.minutes === mins);
      setIsCustomMinutes(!isPreset);
      setCustomMinutesInput(String(mins));
    }
  }, [user]);

  const handleLeadTimePreset = (minutes: number) => {
    setIsCustomMinutes(false);
    setTelegramReminderMinutes(minutes);
    setCustomMinutesInput(String(minutes));
  };

  const handleCustomMinutesChange = (val: string) => {
    setCustomMinutesInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 1440) {
      setTelegramReminderMinutes(parsed);
    }
  };

  // Admin Action: Validate Telegram Token live with Telegram API
  const handleValidateToken = async () => {
    try {
      setIsValidatingToken(true);
      setValidationResult(null);

      const tokenToTest = adminTokenInput.trim() || undefined;
      const res = await api.telegram.validateToken(tokenToTest);
      setValidationResult(res);

      if (res.valid) {
        toast.success(
          "Token Verified Successfully!",
          `Connected to bot @${res.username || "bot"} (ID: ${res.botId}, Name: "${res.botName || "Telegram Bot"}").`
        );
        // Automatically sync bot username if detected
        if (res.username && res.username !== adminBotUsername) {
          setAdminBotUsername(res.username);
        }
      } else {
        toast.error(
          "Verification Failed",
          res.errorMessage || "Telegram API rejected the token."
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Validation request failed";
      setValidationResult({
        valid: false,
        errorMessage: msg,
      });
      toast.error("Verification Request Failed", msg);
    } finally {
      setIsValidatingToken(false);
    }
  };

  // Admin Action: Save Server Bot Gateway Configuration
  const handleSaveAdminConfig = async () => {
    try {
      setIsSavingAdminConfig(true);
      const payload: TelegramBotConfigUpdate = {
        botEnabled: adminBotEnabled,
        botUsername: adminBotUsername.trim().replace(/^@/, ""),
        defaultChatId: adminDefaultChatId.trim(),
        defaultReminderMinutes: adminLeadMinutes,
      };

      if (adminTokenInput.trim() && !adminTokenInput.includes("••••")) {
        payload.botToken = adminTokenInput.trim();
      }

      const updated = await api.telegram.updateConfig(payload);
      setAdminConfig(updated);
      setAdminTokenInput("");
      setValidationResult(null);

      // Refresh public status
      const freshStatus = await api.telegram.getStatus();
      setBotStatus(freshStatus);

      toast.success(
        "Server Gateway Saved!",
        "Telegram credentials are securely saved in MySQL and active immediately with zero restart."
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save server Telegram configuration";
      toast.error("Save Failed", msg);
    } finally {
      setIsSavingAdminConfig(false);
    }
  };

  // Admin Action: Send Server Broadcast Test
  const handleSendAdminBroadcastTest = async () => {
    const target = adminDefaultChatId.trim() || botStatus?.defaultChatId;
    if (!target) {
      toast.error("Broadcast Chat ID Missing", "Please enter a Default Chat ID or Channel ID before testing.");
      return;
    }

    try {
      setIsSendingAdminBroadcastTest(true);
      const res = await api.telegram.sendTest(
        target,
        "🔔 *MMS BOT GATEWAY SYSTEM TEST*\n\n" +
          "✅ *Gateway Status:* Online & Verified\n" +
          "🤖 *Bot Handle:* @" + (adminBotUsername || "MMS_Meeting_Alert_Bot") + "\n" +
          "📡 *Default Broadcast Chat ID:* `" + target + "`\n\n" +
          "Enterprise meeting alerts, automatic reminders, and calendar notifications are fully operational!"
      );
      toast.success(
        "Broadcast Test Sent!",
        `Dispatched test notification to chat ${res.targetChatId} via @${adminBotUsername}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not dispatch broadcast test message";
      toast.error("Delivery Failed", msg);
    } finally {
      setIsSendingAdminBroadcastTest(false);
    }
  };

  // User Action: Save Personal Telegram Preferences
  const handleSaveTelegram = async () => {
    if (!user) {
      toast.error("Authentication Error", "You must be signed in to save preferences.");
      return;
    }

    const leadTime = isCustomMinutes
      ? parseInt(customMinutesInput, 10) || 10
      : telegramReminderMinutes;

    if (leadTime < 1 || leadTime > 1440) {
      toast.error("Invalid Lead Time", "Reminder countdown lead time must be between 1 and 1440 minutes.");
      return;
    }

    try {
      setIsSavingTelegram(true);
      const updatedUser = await api.telegram.updateUserSettings(user.userId, {
        telegramChatId: telegramChatId.trim(),
        telegramUsername: telegramUsername.trim(),
        telegramReminderMinutes: leadTime,
        telegramNotificationsEnabled,
      });

      setUser(updatedUser);
      toast.success(
        "Telegram Settings Saved!",
        `Automated reminders will dispatch ${leadTime} minutes prior to upcoming meetings.`
      );
    } catch {
      toast.error("Save Failed", "Could not persist Telegram alert preferences.");
    } finally {
      setIsSavingTelegram(false);
    }
  };

  // User Action: Send Personal Test Alert
  const handleSendTestAlert = async () => {
    const target = telegramChatId.trim() || botStatus?.defaultChatId;
    if (!target) {
      toast.error("Chat ID Missing", "Please enter your Telegram Chat ID before testing.");
      return;
    }

    try {
      setIsSendingTest(true);
      const res = await api.telegram.sendTest(target);
      toast.success(
        "Test Dispatched!",
        `Notification sent to Chat ID ${res.targetChatId} via @${botStatus?.botUsername || "MMS_Meeting_Alert_Bot"}.`
      );
    } catch {
      toast.error("Delivery Failed", "Could not dispatch test message to Telegram.");
    } finally {
      setIsSendingTest(false);
    }
  };

  const playChimePreview = () => {
    try {
      setIsPlayingChime(true);
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      title: "In-App Audio Chime & Banner",
      description: "Display an in-app banner and sound before your meeting starts",
      badge: "Pre-meeting",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Notification & Alert Channels
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure real-time Telegram bot broadcasts, live bot credentials, countdown lead times, in-app triggers, and email digests.
        </p>
      </div>

      {/* ===================== SECTION A: ADMIN BOT GATEWAY CONFIGURATION ===================== */}
      {effectiveIsAdmin && (
        <div className="rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-linear-to-br from-white via-violet-50/25 to-indigo-50/20 dark:from-slate-900/90 dark:via-[#111827] dark:to-slate-900/90 shadow-xs overflow-hidden">
          {/* Admin Gateway Header */}
          <div className="px-5 py-4 border-b border-violet-100/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Telegram Server Bot Gateway
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-violet-100 text-violet-800 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-violet-700" />
                    Admin Config
                  </span>
                  {adminConfig?.hasToken && adminBotEnabled ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Gateway Online
                    </span>
                  ) : !adminConfig?.hasToken ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      Token Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      Gateway Inactive
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Manage the server-side Telegram bot credentials stored directly in MySQL with instant live activation.
                </p>
              </div>
            </div>

            {/* Master Bot Gateway Switch */}
            <div className="flex items-center gap-2.5 self-end sm:self-center bg-violet-50/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-violet-100 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {adminBotEnabled ? "Gateway Active" : "Gateway Paused"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={adminBotEnabled}
                onClick={() => setAdminBotEnabled(!adminBotEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                  adminBotEnabled ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    adminBotEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Admin Gateway Body */}
          <div className="p-5 space-y-4">
            {/* Live Token Verification Banner (if tested) */}
            {validationResult && (
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  validationResult.valid
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                {validationResult.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-xs">
                  {validationResult.valid ? (
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        <span>Telegram Bot Verified & Ready</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-200/80 text-emerald-900 font-mono">
                          ID: {validationResult.botId}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                        Successfully connected to bot{" "}
                        <span className="font-bold">@{validationResult.username}</span>
                        {validationResult.botName && ` (${validationResult.botName})`}. Outgoing reminder alerts will dispatch seamlessly.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold">Token Verification Failed</div>
                      <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                        {validationResult.errorMessage || "The Telegram API returned an error for this token."}
                      </p>
                      <p className="text-[10px] text-rose-700 mt-1">
                        Tip: Open Telegram, chat with <span className="font-semibold">@BotFather</span>, and issue <code className="bg-rose-100 px-1 py-0.2 rounded font-mono">/token</code> to inspect or regenerate your bot key.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Credential Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bot API Token */}
              <div className="md:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-violet-600" />
                    <span>Telegram Bot Token</span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {adminConfig?.hasToken ? (
                      <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Stored in MySQL ({adminConfig.botTokenMasked})
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold">Not configured</span>
                    )}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showToken ? "text" : "password"}
                    value={adminTokenInput}
                    onChange={(e) => setAdminTokenInput(e.target.value)}
                    placeholder={
                      adminConfig?.hasToken
                        ? "Enter new token to replace existing stored key"
                        : "Paste bot token e.g. 8874617484:AAFev-b... from @BotFather"
                    }
                    className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs font-mono text-slate-900 bg-white shadow-2xs"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      title={showToken ? "Hide Token" : "Show Token"}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleValidateToken}
                      disabled={isValidatingToken || (!adminTokenInput.trim() && !adminConfig?.hasToken)}
                      className="px-2.5 py-1 rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-900 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3 h-3 ${isValidatingToken ? "animate-spin text-violet-700" : ""}`} />
                      <span>{isValidatingToken ? "Testing..." : "Verify"}</span>
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Issued exclusively by <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-violet-700 font-semibold hover:underline">@BotFather</a>. Never committed to Git repositories or hardcoded in configuration files.
                </p>
              </div>

              {/* Bot Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Bot Handle / Username</span>
                  <span className="text-[10px] text-slate-400 font-normal">Without @</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">@</span>
                  <input
                    type="text"
                    value={adminBotUsername}
                    onChange={(e) => setAdminBotUsername(e.target.value.replace(/^@/, ""))}
                    placeholder="MMS_Meeting_Alert_Bot"
                    className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs font-mono text-slate-900 bg-white shadow-2xs"
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed truncate">
                  Link:{" "}
                  <a
                    href={`https://t.me/${adminBotUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-700 font-semibold hover:underline inline-flex items-center gap-0.5"
                  >
                    t.me/{adminBotUsername || "bot"}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </p>
              </div>

              {/* Default Broadcast Chat ID */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Default Broadcast Chat / Channel ID</span>
                  <span className="text-[10px] text-slate-400 font-normal">Company group or channel</span>
                </label>
                <input
                  type="text"
                  value={adminDefaultChatId}
                  onChange={(e) => setAdminDefaultChatId(e.target.value)}
                  placeholder="e.g. 1035574371 or -1001234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs font-mono text-slate-900 bg-white shadow-2xs"
                />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Fallback recipient for system-wide announcements or unassigned room event alerts.
                </p>
              </div>

              {/* Default Lead Minutes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Default System Lead Time</span>
                  <span className="text-[10px] text-slate-400 font-normal">Minutes</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={adminLeadMinutes}
                  onChange={(e) => setAdminLeadMinutes(parseInt(e.target.value, 10) || 10)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-xs font-mono text-slate-900 bg-white shadow-2xs"
                />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Default countdown minutes for participants who have not set a custom preference.
                </p>
              </div>
            </div>

            {/* Admin Action Footer */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-violet-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSendAdminBroadcastTest}
                disabled={isSendingAdminBroadcastTest || !adminConfig?.hasToken}
                className="px-3.5 py-2 rounded-xl border border-violet-200 bg-violet-50/70 hover:bg-violet-100 text-xs font-semibold text-violet-900 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-violet-700" />
                <span>{isSendingAdminBroadcastTest ? "Sending Test..." : "Send Server Broadcast Test"}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAdminConfig}
                disabled={isSavingAdminConfig}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingAdminConfig ? "Persisting..." : "Save Server Configuration"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== SECTION B: PERSONAL TELEGRAM ALERTS CARD ===================== */}
      <div className="rounded-2xl border border-sky-200/90 dark:border-slate-800 bg-linear-to-br from-white via-sky-50/20 to-indigo-50/20 dark:from-slate-900/90 dark:via-[#111827] dark:to-slate-900/90 shadow-xs overflow-hidden">
        {/* User Card Header */}
        <div className="px-5 py-4 border-b border-sky-100/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Send className="w-4 h-4 -rotate-12 translate-x-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Personal Telegram Meeting Alerts
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800">
                  Staff Preference
                </span>
                {botStatus?.botEnabled && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Official Bot:{" "}
                <a
                  href={botStatus?.botLink || `https://t.me/${adminBotUsername || "MMS_Meeting_Alert_Bot"}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-sky-700 hover:underline inline-flex items-center gap-0.5"
                >
                  @{botStatus?.botUsername || adminBotUsername || "MMS_Meeting_Alert_Bot"}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </p>
            </div>
          </div>

          {/* User Alerts Switch */}
          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <span className="text-[11px] font-semibold text-slate-600">
              {telegramNotificationsEnabled ? "My Alerts Active" : "My Alerts Paused"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={telegramNotificationsEnabled}
              onClick={() => setTelegramNotificationsEnabled(!telegramNotificationsEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
                telegramNotificationsEnabled ? "bg-sky-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  telegramNotificationsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* User Card Body */}
        <div className="p-5 space-y-5">
          {/* User Chat ID & Username Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Your Personal Telegram Chat ID</span>
                <span className="text-[10px] text-slate-400 font-normal">Required for direct DM alerts</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="e.g. 1035574371"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-xs font-mono text-slate-900 bg-white shadow-2xs"
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Find your Chat ID by messaging{" "}
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-700 font-semibold hover:underline inline-flex items-center gap-0.5"
                >
                  @userinfobot
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>{" "}
                on Telegram or typing <code className="bg-slate-100 px-1 py-0.2 rounded font-mono text-slate-700">/start</code> in our official bot.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Your Telegram Username (Optional)</span>
                <span className="text-[10px] text-slate-400 font-normal">For display & roster tagging</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">@</span>
                <input
                  type="text"
                  value={telegramUsername.replace(/^@/, "")}
                  onChange={(e) => setTelegramUsername(e.target.value.replace(/^@/, ""))}
                  placeholder="username"
                  className="w-full pl-7 pr-3.5 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-xs font-mono text-slate-900 bg-white shadow-2xs"
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Matches your handle: <span className="font-semibold text-slate-700">t.me/{telegramUsername || "username"}</span>
              </p>
            </div>
          </div>

          {/* Dynamic Pre-Meeting Countdown Lead Time Selector */}
          <div className="p-4 rounded-xl border border-sky-100 bg-white/70 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Pre-Meeting Reminder Lead Time
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800">
                    Personal Setting
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Choose how many minutes prior to meeting start time you want the Telegram reminder alert.
                </p>
              </div>

              {/* Dynamic summary pill */}
              <div className="shrink-0 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>
                  {isCustomMinutes
                    ? `${customMinutesInput || 10} min before`
                    : `${telegramReminderMinutes} min before`}
                </span>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_LEAD_TIMES.map((preset) => {
                const isSelected = !isCustomMinutes && telegramReminderMinutes === preset.minutes;
                return (
                  <button
                    key={preset.minutes}
                    type="button"
                    onClick={() => handleLeadTimePreset(preset.minutes)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? "border-sky-600 bg-sky-50/80 text-sky-900 font-bold shadow-2xs ring-1 ring-sky-600/30"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-bold">{preset.label}</span>
                    <span
                      className={`text-[9px] mt-0.5 px-1 rounded ${
                        isSelected
                          ? "bg-sky-600 text-white"
                          : preset.recommended
                          ? "bg-amber-100 text-amber-800 font-semibold"
                          : "text-slate-400"
                      }`}
                    >
                      {preset.badge}
                    </span>
                  </button>
                );
              })}

              {/* Custom input toggle */}
              <button
                type="button"
                onClick={() => setIsCustomMinutes(true)}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isCustomMinutes
                    ? "border-sky-600 bg-sky-50/80 text-sky-900 font-bold shadow-2xs ring-1 ring-sky-600/30"
                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                }`}
              >
                <span className="text-xs font-bold">Custom</span>
                <span
                  className={`text-[9px] mt-0.5 px-1 rounded ${
                    isCustomMinutes ? "bg-sky-600 text-white" : "text-slate-400"
                  }`}
                >
                  Flexible
                </span>
              </button>
            </div>

            {/* Custom Minutes Input field */}
            {isCustomMinutes && (
              <div className="pt-2 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">Alert me:</span>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={customMinutesInput}
                    onChange={(e) => handleCustomMinutesChange(e.target.value)}
                    className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    minutes before start (1 - 1440 mins)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer: Save Preferences & Send Test Alert */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSendTestAlert}
              disabled={isSendingTest}
              className="px-3.5 py-2 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100 text-xs font-semibold text-sky-800 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingTest ? "Sending Test..." : "Send Test to My Telegram"}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveTelegram}
              disabled={isSavingTelegram}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingTelegram ? "Saving..." : "Save Telegram Preferences"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== IN-APP NOTIFICATIONS LIST ===================== */}
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

      {/* ===================== EMAIL DELIVERY CADENCE ===================== */}
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
                className={`text-left p-3.5 rounded-xl border transition-all text-xs relative flex flex-col justify-between cursor-pointer ${
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

      {/* ===================== AUDIBLE ALERT SETTINGS ===================== */}
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
