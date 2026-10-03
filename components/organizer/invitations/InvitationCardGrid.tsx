"use client";

import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  Check,
  X,
  Eye,
  Mail,
} from "lucide-react";
import { Meeting, AttendeeResponseStatus } from "@/lib/api";

interface InvitationWithRSVP {
  meeting: Meeting;
  rsvpStatus: AttendeeResponseStatus;
}

interface InvitationCardGridProps {
  invitations: InvitationWithRSVP[];
  loading?: boolean;
  onInspect: (meeting: Meeting) => void;
  onRSVP: (meetingId: number, status: AttendeeResponseStatus) => Promise<void>;
  actionLoading?: boolean;
}

export function InvitationCardGrid({
  invitations,
  loading = false,
  onInspect,
  onRSVP,
  actionLoading = false,
}: InvitationCardGridProps) {
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

  const getRSVPBadge = (status: AttendeeResponseStatus) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            ACCEPTED
          </span>
        );
      case "PENDING":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            AWAITING RESPONSE
          </span>
        );
      case "DECLINED":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            DECLINED
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

  if (invitations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Mail className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-900">No Invitations Found</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No meeting invitations matched your filter query.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {invitations.map(({ meeting, rsvpStatus }) => (
        <div
          key={meeting.meetingId}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group"
        >
          <div>
            {/* Top Bar: RSVP status and Room */}
            <div className="flex items-center justify-between gap-2 mb-2">
              {getRSVPBadge(rsvpStatus)}
              <div className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{meeting.room?.name || "Room"}</span>
              </div>
            </div>

            {/* Title & Purpose */}
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {meeting.title}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <UserIcon className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-700 truncate">
                {meeting.organizer?.name || "Organizer"}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400 truncate">
                {meeting.organizer?.departmentName || "General"}
              </span>
            </div>

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
          </div>

          {/* Action buttons */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onInspect(meeting)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-indigo-700 hover:border-indigo-300 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>

            <div className="flex items-center gap-1.5">
              {rsvpStatus !== "ACCEPTED" && (
                <button
                  type="button"
                  onClick={() => onRSVP(meeting.meetingId, "ACCEPTED")}
                  disabled={actionLoading}
                  className="py-1.5 px-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Accept Invitation"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept</span>
                </button>
              )}

              {rsvpStatus !== "DECLINED" && (
                <button
                  type="button"
                  onClick={() => onRSVP(meeting.meetingId, "DECLINED")}
                  disabled={actionLoading}
                  className="py-1.5 px-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Decline Invitation"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Decline</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default InvitationCardGrid;
