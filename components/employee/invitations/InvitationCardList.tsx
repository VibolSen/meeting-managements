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
  AlertTriangle,
  MailQuestion,
} from "lucide-react";

interface InvitationCardListProps {
  meetings: Meeting[];
  currentUser: User | null;
  conflictsMap: Record<number, Meeting>; // meetingId -> conflicting accepted meeting
  onSelectMeeting: (meeting: Meeting) => void;
  onUpdateRsvp: (meetingId: number, status: AttendeeResponseStatus) => void;
  actionLoadingId?: number | null;
}

export function InvitationCardList({
  meetings,
  currentUser,
  conflictsMap,
  onSelectMeeting,
  onUpdateRsvp,
  actionLoadingId,
}: InvitationCardListProps) {
  const formatDateTime = (timeStr?: string) => {
    if (!timeStr) return { date: "", time: "" };
    try {
      const d = new Date(timeStr);
      return {
        date: d.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    } catch {
      return { date: timeStr, time: "" };
    }
  };

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <MailQuestion className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No Invitations Found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No meeting invitations match your selected tab or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {meetings.map((meeting) => {
        const userAttendee = meeting.attendees?.find(
          (a) => a.userId === currentUser?.userId
        );
        const rsvpStatus = userAttendee?.responseStatus || "PENDING";
        const conflictingMeeting = conflictsMap[meeting.meetingId];
        const isActionLoading = actionLoadingId === meeting.meetingId;
        const startFormatted = formatDateTime(meeting.startTime);
        const endFormatted = formatDateTime(meeting.endTime);

        return (
          <div
            key={meeting.meetingId}
            className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between gap-4 ${
              conflictingMeeting
                ? "bg-amber-50/30 border-amber-300/80 hover:border-amber-400"
                : "bg-white border-slate-200/90 hover:border-indigo-300"
            }`}
          >
            <div className="space-y-3">
              {/* Header: Date Pill & Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{startFormatted.date}</span>
                  <span className="text-slate-300">•</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{startFormatted.time} - {endFormatted.time}</span>
                </div>

                <Badge
                  variant={
                    rsvpStatus === "ACCEPTED"
                      ? "confirmed"
                      : rsvpStatus === "DECLINED"
                      ? "cancelled"
                      : "pending"
                  }
                >
                  {rsvpStatus}
                </Badge>
              </div>

              {/* Conflict Alert Box if Overlap with Accepted Meeting */}
              {conflictingMeeting && rsvpStatus === "PENDING" && (
                <div className="p-3 rounded-xl bg-amber-100/70 border border-amber-300/80 text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Time Overlap Detected!</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    You already accepted <strong>"{conflictingMeeting.title}"</strong> during this same timeframe.
                  </p>
                </div>
              )}

              {/* Title & Purpose */}
              <div>
                <h4
                  onClick={() => onSelectMeeting(meeting)}
                  className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer truncate"
                >
                  {meeting.title}
                </h4>
                {meeting.purpose && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {meeting.purpose}
                  </p>
                )}
              </div>

              {/* Meeting Meta: Room & Organizer */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">
                    {meeting.room?.name || "Room"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 min-w-0 justify-end">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-600 truncate">
                    {meeting.attendees?.length || 0} participants
                  </span>
                </div>

                <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="text-slate-400">Host:</span>
                  <span className="font-semibold text-slate-800 truncate">
                    {meeting.organizer?.name || "Organizer"}
                  </span>
                  {meeting.organizer?.departmentName && (
                    <span className="text-slate-400 truncate">
                      ({meeting.organizer.departmentName})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectMeeting(meeting)}
                className="h-8 text-xs px-2.5 bg-white"
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                Inspect
              </Button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={isActionLoading || rsvpStatus === "DECLINED"}
                  onClick={() => onUpdateRsvp(meeting.meetingId, "DECLINED")}
                  className={`h-8 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                    rsvpStatus === "DECLINED"
                      ? "bg-rose-100 text-rose-800 border-rose-200 opacity-60 cursor-default"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                  }`}
                  title="Decline Invitation"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Decline</span>
                </button>

                <button
                  type="button"
                  disabled={isActionLoading || rsvpStatus === "ACCEPTED"}
                  onClick={() => onUpdateRsvp(meeting.meetingId, "ACCEPTED")}
                  className={`h-8 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
                    rsvpStatus === "ACCEPTED"
                      ? "bg-emerald-600 text-white opacity-80 cursor-default"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                  title="Accept Invitation"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{rsvpStatus === "ACCEPTED" ? "Accepted" : "Accept"}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default InvitationCardList;
