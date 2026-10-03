"use client";

import React from "react";
import { Meeting, User, AttendeeResponseStatus } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  X,
  Eye,
  CalendarX2,
} from "lucide-react";

interface EmployeeScheduleListProps {
  meetings: Meeting[];
  currentUser: User | null;
  onSelectMeeting: (meeting: Meeting) => void;
  onUpdateRsvp: (meetingId: number, status: AttendeeResponseStatus) => void;
  rsvpActionLoadingId?: number | null;
}

export function EmployeeScheduleList({
  meetings,
  currentUser,
  onSelectMeeting,
  onUpdateRsvp,
  rsvpActionLoadingId,
}: EmployeeScheduleListProps) {
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  const formatDateHeader = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);

      if (dateOnly.getTime() === today.getTime()) {
        return "Today — " + date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
      } else if (dateOnly.getTime() === tomorrow.getTime()) {
        return "Tomorrow — " + date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
      } else if (dateOnly.getTime() === yesterday.getTime()) {
        return "Yesterday — " + date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
      } else {
        return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
      }
    } catch {
      return dateStr;
    }
  };

  // Group meetings by Date (YYYY-MM-DD)
  const groupedMeetings = React.useMemo(() => {
    const groups: Record<string, Meeting[]> = {};
    meetings.forEach((m) => {
      const dateKey = m.startTime ? m.startTime.split("T")[0] : "Undated";
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(m);
    });

    // Sort dates
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [meetings]);

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <CalendarX2 className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No Meetings Found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No meeting sessions match your current timeframe or filter criteria. Check another filter or date range.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedMeetings.map(([dateKey, items]) => (
        <div key={dateKey} className="space-y-3">
          {/* Date Section Header */}
          <div className="flex items-center gap-2 px-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              {formatDateHeader(dateKey)}
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
              {items.length} {items.length === 1 ? "session" : "sessions"}
            </span>
            <div className="flex-1 h-px bg-slate-200/80 ml-2" />
          </div>

          {/* Meeting Cards List */}
          <div className="space-y-2.5">
            {items.map((meeting) => {
              const userAttendee = meeting.attendees?.find(
                (a) => a.userId === currentUser?.userId
              );
              const rsvpStatus = userAttendee?.responseStatus || "PENDING";
              const isActionLoading = rsvpActionLoadingId === meeting.meetingId;

              return (
                <div
                  key={meeting.meetingId}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left Column: Time & Details */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Time Box */}
                    <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center shrink-0 min-w-[85px]">
                      <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-900 font-mono">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{formatTime(meeting.startTime)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        to {formatTime(meeting.endTime)}
                      </span>
                    </div>

                    {/* Information */}
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          onClick={() => onSelectMeeting(meeting)}
                          className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer truncate"
                        >
                          {meeting.title}
                        </h4>
                        <Badge
                          variant={
                            rsvpStatus === "ACCEPTED"
                              ? "confirmed"
                              : rsvpStatus === "DECLINED"
                              ? "cancelled"
                              : "pending"
                          }
                        >
                          RSVP: {rsvpStatus}
                        </Badge>
                      </div>

                      {meeting.purpose && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {meeting.purpose}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{meeting.room?.name || "Room"}</span>
                          {meeting.room?.location && (
                            <span className="text-slate-400">({meeting.room.location})</span>
                          )}
                        </span>

                        <span className="flex items-center gap-1.5 text-slate-500">
                          <span>Organizer:</span>
                          <strong className="text-slate-700 font-semibold">
                            {meeting.organizer?.name || "Organizer"}
                          </strong>
                        </span>

                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{meeting.attendees?.length || 0} participants</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                    {/* If RSVP is PENDING, show quick Accept & Decline */}
                    {rsvpStatus === "PENDING" && (
                      <>
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => onUpdateRsvp(meeting.meetingId, "ACCEPTED")}
                          className="h-8 px-2.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>

                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => onUpdateRsvp(meeting.meetingId, "DECLINED")}
                          className="h-8 px-2.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectMeeting(meeting)}
                      className="h-8 text-xs px-2.5 bg-white"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EmployeeScheduleList;
