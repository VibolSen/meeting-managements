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

interface InvitationTableProps {
  invitations: InvitationWithRSVP[];
  loading?: boolean;
  onInspect: (meeting: Meeting) => void;
  onRSVP: (meetingId: number, status: AttendeeResponseStatus) => Promise<void>;
  actionLoading?: boolean;
}

export function InvitationTable({
  invitations,
  loading = false,
  onInspect,
  onRSVP,
  actionLoading = false,
}: InvitationTableProps) {
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
        year: "numeric",
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
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
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
          You currently have no meeting invitations matching this filter.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Meeting Title</th>
              <th className="py-3 px-4">Organizer</th>
              <th className="py-3 px-4">Room Location</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">My RSVP</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {invitations.map(({ meeting, rsvpStatus }) => (
              <tr
                key={meeting.meetingId}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* Title & Purpose */}
                <td className="py-3.5 px-4 max-w-[220px]">
                  <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {meeting.title}
                  </div>
                  {meeting.purpose && (
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {meeting.purpose}
                    </div>
                  )}
                </td>

                {/* Organizer */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{meeting.organizer?.name || "Organizer"}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pl-5">
                    {meeting.organizer?.departmentName || "General"}
                  </div>
                </td>

                {/* Room Location */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{meeting.room?.name || "Room"}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pl-5">
                    {meeting.room?.location || "Main HQ"}
                  </div>
                </td>

                {/* Date & Time */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{formatDate(meeting.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pl-5 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>
                      {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                    </span>
                  </div>
                </td>

                {/* RSVP Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getRSVPBadge(rsvpStatus)}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    {rsvpStatus !== "ACCEPTED" && (
                      <button
                        type="button"
                        onClick={() => onRSVP(meeting.meetingId, "ACCEPTED")}
                        disabled={actionLoading}
                        className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Accept Invitation"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Accept</span>
                      </button>
                    )}

                    {rsvpStatus !== "DECLINED" && (
                      <button
                        type="button"
                        onClick={() => onRSVP(meeting.meetingId, "DECLINED")}
                        disabled={actionLoading}
                        className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Decline Invitation"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Decline</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onInspect(meeting)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all shadow-2xs cursor-pointer"
                      title="Inspect Meeting Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InvitationTable;
