"use client";

import React from "react";
import { Meeting } from "@/lib/api";
import { Calendar, Clock, MapPin, Users, ChevronRight, Sparkles } from "lucide-react";

interface OrganizerUpcomingFeedProps {
  meetings: Meeting[];
  loading?: boolean;
  onSelectMeeting: (meeting: Meeting) => void;
  onScheduleNew: () => void;
}

export function OrganizerUpcomingFeed({
  meetings,
  loading = false,
  onSelectMeeting,
  onScheduleNew,
}: OrganizerUpcomingFeedProps) {
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  const formatDate = (timeStr?: string) => {
    if (!timeStr) return "";
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return timeStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            CONFIRMED
          </span>
        );
      case "PENDING":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            PENDING APPROVAL
          </span>
        );
      case "CANCELLED":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            CANCELLED
          </span>
        );
      case "COMPLETED":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Upcoming Organized Meetings</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Meetings you coordinate sorted by closest scheduled time
          </p>
        </div>
        <button
          type="button"
          onClick={onScheduleNew}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Schedule New</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Upcoming Meetings</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              You haven&apos;t scheduled any upcoming conferences yet. Use the booking wizard to reserve a room and assign equipment.
            </p>
            <button
              type="button"
              onClick={onScheduleNew}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Schedule a Meeting</span>
            </button>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.meetingId}
              onClick={() => onSelectMeeting(meeting)}
              className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {meeting.title}
                  </h4>
                  {getStatusBadge(meeting.status)}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(meeting.startTime)}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                  </span>
                  <span className="flex items-center gap-1 font-medium truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {meeting.room?.name || "Room Assigned"} ({meeting.room?.location || "Main HQ"})
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {meeting.attendees?.length || 0} Attendees
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-indigo-700 hover:border-indigo-300 text-xs font-bold transition-all shadow-2xs group-hover:bg-indigo-50/40"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OrganizerUpcomingFeed;
