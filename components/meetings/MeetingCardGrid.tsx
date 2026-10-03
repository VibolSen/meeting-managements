"use client";

import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  Check,
  Ban,
  Inbox,
  Package,
  UserCheck,
  Building,
} from "lucide-react";
import { Meeting, MeetingStatus, AttendeeResponseStatus, User } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MeetingCardGridProps {
  meetings: Meeting[];
  loading: boolean;
  isAdmin: boolean;
  currentUser?: User | null;
  actionLoading: boolean;
  selectedMeetingIds: Set<number>;
  onToggleSelectMeeting: (meetingId: number) => void;
  onViewMeeting: (meeting: Meeting) => void;
  onApproveMeeting: (meetingId: number) => void;
  onRequestCancelMeeting: (meeting: Meeting) => void;
  onRSVP?: (meetingId: number, status: AttendeeResponseStatus) => void;
}

export function MeetingCardGrid({
  meetings,
  loading,
  isAdmin,
  currentUser,
  actionLoading,
  selectedMeetingIds,
  onToggleSelectMeeting,
  onViewMeeting,
  onApproveMeeting,
  onRequestCancelMeeting,
  onRSVP,
}: MeetingCardGridProps) {
  const getStatusBadge = (status: MeetingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="confirmed">Confirmed</Badge>;
      case "PENDING":
        return <Badge variant="pending">Pending Approval</Badge>;
      case "CANCELLED":
        return <Badge variant="cancelled">Cancelled</Badge>;
      case "COMPLETED":
        return <Badge variant="completed">Completed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const formatSchedule = (startIso: string, endIso: string) => {
    try {
      const start = new Date(startIso);
      const end = new Date(endIso);
      const dateStr = start.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const startTimeStr = start.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const endTimeStr = end.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return { dateStr, timeRange: `${startTimeStr} – ${endTimeStr}` };
    } catch {
      return {
        dateStr: startIso.slice(0, 10),
        timeRange: `${startIso.slice(11, 16)} – ${endIso.slice(11, 16)}`,
      };
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={`loading-card-${idx}`}
            className="p-5 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 bg-slate-200 rounded-full w-24" />
              <div className="h-4 bg-slate-200 rounded w-16" />
            </div>
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-3.5 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-1/2 pt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-700">No meetings found</p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Try changing your filter settings or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {meetings.map((m) => {
        const isSelected = selectedMeetingIds.has(m.meetingId);
        const schedule = formatSchedule(m.startTime, m.endTime);
        const isOrganizer = m.organizer?.userId === currentUser?.userId;
        const userAttendee = m.attendees?.find((a) => a.userId === currentUser?.userId);
        const materialCount = m.materials?.length || 0;
        const staffCount = m.staffAssignments?.length || 0;
        const attendeeCount = m.attendees?.length || 0;

        return (
          <Card
            key={m.meetingId}
            className={`p-4 sm:p-5 border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between group ${
              isSelected ? "ring-2 ring-indigo-500 bg-indigo-50/20" : ""
            }`}
          >
            {/* Top Bar: Checkbox, Status & Organizer tag */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectMeeting(m.meetingId)}
                      className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                    />
                  )}
                  {getStatusBadge(m.status)}
                </div>

                {isOrganizer && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold">
                    Organizer
                  </span>
                )}
              </div>

              {/* Title & Purpose */}
              <h3
                onClick={() => onViewMeeting(m)}
                className="text-sm sm:text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
                title={m.title}
              >
                {m.title}
              </h3>

              {m.purpose ? (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                  {m.purpose}
                </p>
              ) : (
                <div className="min-h-[32px] text-[11px] text-slate-400 italic mt-1">
                  No additional agenda description.
                </div>
              )}

              {/* Schedule Info Chip */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-800">{schedule.dateStr}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{schedule.timeRange}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600 pt-1 border-t border-slate-200/60">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <strong className="text-slate-800 truncate">{m.room?.name || "Facility unassigned"}</strong>
                  {m.room?.location && (
                    <span className="text-[11px] text-slate-400 truncate">({m.room.location})</span>
                  )}
                </div>
              </div>

              {/* Logistics Counter Badges */}
              <div className="flex items-center gap-2 mt-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span>{attendeeCount} Attendees</span>
                </span>

                {materialCount > 0 && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-50 border border-cyan-200 text-cyan-700 font-medium text-[10px]">
                    <Package className="w-3 h-3 text-cyan-600" />
                    <span>{materialCount} items</span>
                  </span>
                )}

                {staffCount > 0 && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-violet-50 border border-violet-200 text-violet-700 font-medium text-[10px]">
                    <UserCheck className="w-3 h-3 text-violet-600" />
                    <span>{staffCount} staff</span>
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                By: {m.organizer?.name || "Admin"}
              </span>

              <div className="flex items-center gap-1.5">
                {/* Quick Approve (Admin only, when Pending) */}
                {isAdmin && m.status === "PENDING" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onApproveMeeting(m.meetingId)}
                    disabled={actionLoading}
                    leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    className="text-xs h-8 font-semibold text-emerald-700 bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100"
                  >
                    Approve
                  </Button>
                )}

                {/* Quick Cancel (When Pending or Confirmed) */}
                {(isAdmin || isOrganizer) &&
                  (m.status === "PENDING" || m.status === "CONFIRMED") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onRequestCancelMeeting(m)}
                      disabled={actionLoading}
                      leftIcon={<Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                      className="text-xs h-8 font-semibold text-rose-700 border-rose-200 hover:bg-rose-50"
                    >
                      Cancel
                    </Button>
                  )}

                {/* View Details */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onViewMeeting(m)}
                  leftIcon={<Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                  className="text-xs h-8 font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
                >
                  Details
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
