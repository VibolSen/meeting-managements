import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Download,
  ExternalLink,
  ChevronDown,
  Check,
} from "lucide-react";
import { SiGooglecalendar } from "react-icons/si";
import { Meeting } from "@/lib/api";
import {
  downloadIcsFile,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
} from "@/lib/calendarSync";
import { useToast } from "@/components/Toast";

interface CalendarSyncDropdownProps {
  meeting: Meeting;
  locationName?: string;
  size?: "sm" | "default";
  variant?: "outline" | "primary" | "ghost";
  className?: string;
}

export function CalendarSyncDropdown({
  meeting,
  locationName,
  size = "sm",
  variant = "outline",
  className = "",
}: CalendarSyncDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleDownloadIcs = () => {
    try {
      downloadIcsFile(meeting, locationName);
      setDownloaded(true);
      toast.success("Calendar File (.ics) Downloaded", "Open the file to import into Apple Calendar or Outlook.");
      setTimeout(() => setDownloaded(false), 2500);
      setIsOpen(false);
    } catch {
      toast.error("Download Failed", "Unable to generate calendar file.");
    }
  };

  const handleOpenGoogle = () => {
    const url = getGoogleCalendarUrl(meeting, locationName);
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const handleOpenOutlook = () => {
    const url = getOutlookCalendarUrl(meeting, locationName);
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const isSmall = size === "sm";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all cursor-pointer shadow-xs ${
          isSmall ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
        } ${
          variant === "primary"
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : variant === "ghost"
            ? "text-slate-700 hover:bg-slate-100 border border-transparent"
            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
        }`}
        title="Sync or export meeting to personal calendar"
      >
        <Calendar className={isSmall ? "w-3.5 h-3.5 text-indigo-600" : "w-4 h-4 text-indigo-600"} />
        <span>Add to Calendar</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180 text-indigo-600" : "text-slate-400"}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-white border border-slate-200/90 shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Calendar Integration
            </p>
            <p className="text-xs font-semibold text-slate-800 truncate">
              {meeting.title}
            </p>
          </div>

          <div className="py-1">
            {/* Google Calendar Link */}
            <button
              type="button"
              onClick={handleOpenGoogle}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <SiGooglecalendar className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-medium">Google Calendar</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-500" />
            </button>

            {/* Outlook / Office 365 Web Link */}
            <button
              type="button"
              onClick={handleOpenOutlook}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-sm bg-sky-600 flex items-center justify-center text-[9px] text-white font-bold">
                  O
                </div>
                <span className="font-medium">Outlook / Office 365</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-500" />
            </button>

            {/* iCalendar (.ics) Download */}
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors text-left cursor-pointer group border-t border-slate-100/70"
            >
              <div className="flex items-center gap-2">
                {downloaded ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600" />
                )}
                <div>
                  <p className="font-medium">Download .ics File</p>
                  <p className="text-[10px] text-slate-400">Apple Calendar, Outlook Desktop</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
