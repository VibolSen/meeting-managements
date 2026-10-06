"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  Info,
  Sparkles,
  Smartphone,
  Tag,
  Clock,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  ExternalLink,
} from "lucide-react";
import {
  api,
  NotificationTemplate,
  NotificationType,
  TelegramStatus,
} from "@/lib/api";
import { useToast } from "@/components/Toast";

const TEMPLATE_TYPES: Array<{
  type: NotificationType;
  label: string;
  icon: React.ElementType;
  badge: string;
  description: string;
}> = [
  {
    type: "REMINDER",
    label: "Countdown Reminder",
    icon: Clock,
    badge: "Auto-Scheduled",
    description: "Sent automatically before meeting starts according to each participant's personal lead time (default 10m).",
  },
  {
    type: "CONFIRMATION",
    label: "Meeting Created",
    icon: CalendarCheck,
    badge: "Instant",
    description: "Dispatched to room organizer and invited attendees once meeting booking is established.",
  },
  {
    type: "CHANGE",
    label: "Approved & Rescheduled",
    icon: CalendarClock,
    badge: "Status Update",
    description: "Sent when an administrator approves a meeting or updates the room, time, or agenda.",
  },
  {
    type: "CANCELLATION",
    label: "Cancellation Notice",
    icon: CalendarX,
    badge: "Critical Alert",
    description: "Instant alert when a scheduled meeting is called off and reserved resources are returned.",
  },
];

const AVAILABLE_VARIABLES = [
  { token: "{title}", label: "Meeting Title", sample: "Executive Strategy Alignment" },
  { token: "{room}", label: "Room & Location", sample: "Boardroom A (Floor 4)" },
  { token: "{startTime}", label: "Start Date & Time", sample: "Today • 02:30 PM" },
  { token: "{endTime}", label: "End Time", sample: "03:30 PM" },
  { token: "{organizer}", label: "Organizer Name", sample: "Vibol SEN" },
  { token: "{purpose}", label: "Agenda / Purpose", sample: "Q4 Strategic Roadmap & AV Equipment Review" },
  { token: "{attendees}", label: "Invited Attendees", sample: "Vibol SEN, Alice Johnson, Michael Chang" },
  { token: "{materials}", label: "Equipment / Catering", sample: "4K Laser Projector (1), Whiteboard (1)" },
  { token: "{leadMinutes}", label: "Dynamic Lead Time", sample: "10" },
  { token: "{reason}", label: "Reason Note", sample: "Administrative schedule adjustment" },
];

export function AlertTemplateEditor() {
  const toast = useToast();
  const [selectedType, setSelectedType] = useState<NotificationType>("REMINDER");
  const [templates, setTemplates] = useState<Record<NotificationType, NotificationTemplate | null>>({
    REMINDER: null,
    CONFIRMATION: null,
    CHANGE: null,
    CANCELLATION: null,
  });
  const [activeContent, setActiveContent] = useState<string>("");
  const [previewRendered, setPreviewRendered] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [botStatus, setBotStatus] = useState<TelegramStatus | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load templates & bot status
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedTemplates, status] = await Promise.all([
        api.telegram.getTemplates(),
        api.telegram.getStatus().catch(() => null),
      ]);

      const templateMap: Record<NotificationType, NotificationTemplate | null> = {
        REMINDER: null,
        CONFIRMATION: null,
        CHANGE: null,
        CANCELLATION: null,
      };

      fetchedTemplates.forEach((t) => {
        templateMap[t.type] = t;
      });

      setTemplates(templateMap);
      setBotStatus(status);

      const current = templateMap[selectedType];
      if (current) {
        setActiveContent(current.content);
        updatePreview(current.type, current.content);
      }
    } catch {
      toast.error("Failed to Load", "Could not fetch notification templates from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update preview when content or type changes
  const updatePreview = async (type: NotificationType, content: string) => {
    try {
      const res = await api.telegram.previewTemplate(type, content);
      setPreviewRendered(res.rendered);
    } catch {
      // Fallback local interpolation
      let rendered = content;
      AVAILABLE_VARIABLES.forEach((v) => {
        rendered = rendered.split(v.token).join(v.sample);
      });
      setPreviewRendered(rendered);
    }
  };

  const handleTypeChange = (type: NotificationType) => {
    setSelectedType(type);
    const tmpl = templates[type];
    if (tmpl) {
      setActiveContent(tmpl.content);
      updatePreview(type, tmpl.content);
    }
  };

  const handleContentChange = (newContent: string) => {
    setActiveContent(newContent);
    updatePreview(selectedType, newContent);
  };

  const insertVariable = (token: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeContent;
    const updated = text.substring(0, start) + token + text.substring(end);
    setActiveContent(updated);
    updatePreview(selectedType, updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    }, 50);
  };

  const handleSave = async () => {
    if (!activeContent.trim()) {
      toast.error("Validation Error", "Template content cannot be empty.");
      return;
    }
    try {
      setIsSaving(true);
      const updated = await api.telegram.updateTemplate(selectedType, activeContent);
      setTemplates((prev) => ({
        ...prev,
        [selectedType]: updated,
      }));
      toast.success(
        "Template Saved",
        `Custom template for ${selectedType} is now active for live Telegram broadcasts.`
      );
    } catch {
      toast.error("Save Failed", "Could not update template. Check server permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      const resetTmpl = await api.telegram.resetTemplate(selectedType);
      setTemplates((prev) => ({
        ...prev,
        [selectedType]: resetTmpl,
      }));
      setActiveContent(resetTmpl.content);
      updatePreview(selectedType, resetTmpl.content);
      toast.info("Factory Default Restored", `Reset ${selectedType} alert message to system default.`);
    } catch {
      toast.error("Reset Failed", "Could not reset template to factory defaults.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSendTestToBot = async () => {
    try {
      setIsSendingTest(true);
      const res = await api.telegram.sendTest(undefined, previewRendered);
      toast.success(
        "Telegram Alert Sent!",
        `Dispatched live test preview to chat ID ${res.targetChatId}. Check your Telegram app.`
      );
    } catch {
      toast.error("Delivery Failed", "Could not dispatch test message to Telegram bot.");
    } finally {
      setIsSendingTest(false);
    }
  };

  const currentTemplate = templates[selectedType];
  const isCustomized = currentTemplate?.isCustomized || false;
  const isDirty = currentTemplate ? activeContent !== currentTemplate.content : false;

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bot Status Banner */}
      <div className="p-4 rounded-2xl border border-sky-200/80 bg-linear-to-r from-sky-50/70 via-indigo-50/50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900">Telegram Bot Alert Engine</h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Connected to{" "}
              <a
                href={botStatus?.botLink || "https://t.me/MMS_Meeting_Alert_Bot"}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-sky-700 hover:underline inline-flex items-center gap-0.5"
              >
                @{botStatus?.botUsername || "MMS_Meeting_Alert_Bot"}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              {" "}• Default Admin Chat ID: <span className="font-mono font-medium text-slate-800">{botStatus?.defaultChatId || "1035574371"}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSendTestToBot}
          disabled={isSendingTest}
          className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-center"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSendingTest ? "Sending Test..." : "Send Test to Telegram"}</span>
        </button>
      </div>

      {/* Template Type Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {TEMPLATE_TYPES.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedType === item.type;
          const tmpl = templates[item.type];
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => handleTypeChange(item.type)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/60 shadow-2xs ring-1 ring-indigo-600/30"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      tmpl?.isCustomized
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tmpl?.isCustomized ? "Customized" : "Default"}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {item.label}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Variable Chips Toolbar */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            <span>Insert Dynamic Placeholders</span>
          </div>
          <span className="text-[11px] text-slate-400">Click any token to insert at cursor</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_VARIABLES.map((v) => (
            <button
              key={v.token}
              type="button"
              onClick={() => insertVariable(v.token)}
              title={`Inserts sample: "${v.sample}"`}
              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 text-[11px] font-mono text-indigo-700 font-medium transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>{v.token}</span>
              <span className="text-[10px] text-slate-400 font-sans">({v.label})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Editor & Live Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Pane */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Markdown Message Template</span>
              {isCustomized && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                  Custom Template Active
                </span>
              )}
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {activeContent.length} chars
            </span>
          </div>

          <div className="relative rounded-2xl border border-slate-200 bg-slate-950 p-3 shadow-inner">
            <textarea
              ref={textareaRef}
              value={activeContent}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={13}
              placeholder="Write your Markdown alert template here..."
              className="w-full bg-transparent text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-indigo-700 selection:text-white"
              spellCheck={false}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting || !isCustomized}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isResetting ? "Resetting..." : "Reset to Factory Default"}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Saving..." : isDirty ? "Save Template Changes" : "Saved"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Telegram Mobile Bubble Preview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Smartphone className="w-4 h-4 text-sky-600" />
              <span>Live Telegram Chat Bubble</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Real-time simulation</span>
          </div>

          {/* Mock Telegram App Interface */}
          <div className="rounded-3xl border-4 border-slate-800 bg-[#0f141c] p-3 shadow-xl overflow-hidden max-w-sm mx-auto">
            {/* Phone Top Bar */}
            <div className="flex items-center justify-between px-2 pb-2 text-[10px] text-slate-400 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-[10px]">
                  M
                </div>
                <div>
                  <div className="font-bold text-slate-200">MMS Alert Bot</div>
                  <div className="text-[9px] text-sky-400">bot</div>
                </div>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">11:25 AM</span>
            </div>

            {/* Chat Body Wallpaper */}
            <div className="py-4 px-1 min-h-[300px] flex flex-col justify-end bg-gradient-to-b from-[#141b26] to-[#0e131b] rounded-2xl my-2">
              {/* Telegram Speech Bubble */}
              <div className="bg-[#1e293b] text-slate-100 rounded-2xl rounded-tl-xs p-3.5 shadow-md border border-slate-700/60 max-w-[95%] space-y-2">
                <div className="text-xs whitespace-pre-wrap font-sans leading-relaxed text-slate-200 selection:bg-sky-600">
                  {previewRendered}
                </div>
                <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 pt-1 border-t border-slate-700/40">
                  <span>11:25 AM</span>
                  <CheckCircle2 className="w-3 h-3 text-sky-400" />
                </div>
              </div>
            </div>

            {/* Hint below bubble */}
            <div className="text-center pt-1 text-[10px] text-slate-500">
              Interpolated with active room & attendee context
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
