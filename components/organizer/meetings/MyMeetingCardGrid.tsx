"use client";

import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  Ban,
  Package,
  UserCheck,
} from "lucide-react";
import { Meeting } from "@/lib/api";

interface MyMeetingCardGridProps {
  meetings: Meeting[];
  loading?: boolean;
  onInspect: (meeting: Meeting) => void;
  onCancel: (meeting: Meeting) => void;
}

export function MyMeetingCardGrid({
  meetings,
  loading = false,
  onInspect,
  onCancel,
}: MyMeetingCardGridProps) {
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
            PENDING
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-44 bg-slate-50 border border-slate-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-900">No Meetings Found</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No organized meetings matched your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {meetings.map((meeting) => {
        const canCancel =
          meeting.status !== "CANCELLED" && meeting.status !== "COMPLETED";

        return (
          <div
            key={meeting.meetingId}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              {/* Header: Status and room */}
              <div className="flex items-center justify-between gap-2 mb-2">
                {getStatusBadge(meeting.status)}
                <div className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{meeting.room?.name || "Room Assigned"}</span>
                </div>
              </div>

              {/* Title & Purpose */}
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {meeting.title}
              </h4>
              {meeting.purpose ? (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {meeting.purpose}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic mt-1">No purpose specified</p>
              )}

              {/* Schedule time block */}
              <div className="mt-3.5 space-y-1.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(meeting.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                  </span>
                </div>
              </div>

              {/* Logistics & attendees count */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {meeting.attendees?.length || 0} Attendees
                </span>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1" title="Materials">
                    <Package className="w-3 h-3 text-slate-400" />
                    {meeting.materials?.length || 0}
                  </span>
                  <span className="flex items-center gap-1" title="Staff">
                    <UserCheck className="w-3 h-3 text-slate-400" />
                    {meeting.staffAssignments?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onInspect(meeting)}
                className="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-indigo-700 hover:border-indigo-300 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect</span>
              </button>

              {canCancel && (
                <button
                  type="button"
                  onClick={() => onCancel(meeting)}
                  className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-rose-600 hover:text-rose-700 hover:border-rose-300 hover:bg-rose-50/50 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                  title="Cancel Meeting"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MyMeetingCardGrid;
