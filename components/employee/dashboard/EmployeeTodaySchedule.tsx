"use client";

import React from "react";
import Link from "next/link";
import { Meeting, User } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { UserAvatar } from "@/components/users/UserAvatar";

interface EmployeeTodayScheduleProps {
  todayMeetings: Meeting[];
  currentUser: User | null;
  onSelectMeeting?: (meeting: Meeting) => void;
}

export function EmployeeTodaySchedule({
  todayMeetings,
  currentUser,
  onSelectMeeting,
}: EmployeeTodayScheduleProps) {
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Schedule</h3>
            <p className="text-[11px] text-slate-400">Chronological agenda for today</p>
          </div>
        </div>

        <Link
          href="/employee/my-schedule"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group"
        >
          <span>Full Agenda</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {todayMeetings.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Clear Agenda Today</h4>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            You don't have any conferences or sessions scheduled for today. Enjoy your focused work time!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {todayMeetings.map((meeting) => {
            const userAttendee = meeting.attendees?.find(
              (a) => a.userId === currentUser?.userId
            );
            const rsvpStatus = userAttendee?.responseStatus || "PENDING";

            return (
              <div
                key={meeting.meetingId}
                onClick={() => onSelectMeeting && onSelectMeeting(meeting)}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xs bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold shrink-0 text-center min-w-[75px]">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                      <span>{formatTime(meeting.startTime)}</span>
                    </div>
                    <span className="text-[10px] text-indigo-400 dark:text-indigo-400 font-normal block">
                      to {formatTime(meeting.endTime)}
                    </span>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {meeting.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{meeting.room?.name || "Room"}</span>
                      </span>

                      <span className="flex items-center gap-1 text-slate-400">
                        <span>Organizer:</span>
                        <strong className="text-slate-600 dark:text-slate-300 font-semibold truncate">
                          {meeting.organizer?.name || "Organizer"}
                        </strong>
                      </span>

                      <span className="flex items-center gap-1 text-slate-400">
                        <Users className="w-3 h-3" />
                        <span>{meeting.attendees?.length || 0} attendees</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EmployeeTodaySchedule;
