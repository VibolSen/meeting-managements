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

interface MyMeetingTableProps {
  meetings: Meeting[];
  loading?: boolean;
  onInspect: (meeting: Meeting) => void;
  onCancel: (meeting: Meeting) => void;
}

export function MyMeetingTable({
  meetings,
  loading = false,
  onInspect,
  onCancel,
}: MyMeetingTableProps) {
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
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
          No organized meetings matched your search criteria or filter query.
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
              <th className="py-3 px-4">Title & Purpose</th>
              <th className="py-3 px-4">Room Location</th>
              <th className="py-3 px-4">Scheduled Date & Time</th>
              <th className="py-3 px-4">Attendees</th>
              <th className="py-3 px-4">Logistics</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {meetings.map((meeting) => {
              const canCancel =
                meeting.status !== "CANCELLED" && meeting.status !== "COMPLETED";

              return (
                <tr
                  key={meeting.meetingId}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Title & Purpose */}
                  <td className="py-3.5 px-4 max-w-[240px]">
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {meeting.title}
                    </div>
                    {meeting.purpose && (
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {meeting.purpose}
                      </div>
                    )}
                  </td>

                  {/* Room Location */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{meeting.room?.name || "Unassigned"}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pl-5">
                      {meeting.room?.location || "Main HQ"} (Cap: {meeting.room?.capacity || 0})
                    </div>
                  </td>

                  {/* Scheduled Date & Time */}
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

                  {/* Attendees */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{meeting.attendees?.length || 0} Participants</span>
                    </div>
                  </td>

                  {/* Logistics */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span
                        className="flex items-center gap-1 font-medium"
                        title="Materials reserved"
                      >
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        {meeting.materials?.length || 0}
                      </span>
                      <span
                        className="flex items-center gap-1 font-medium"
                        title="Support staff allocated"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        {meeting.staffAssignments?.length || 0}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(meeting.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onInspect(meeting)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all shadow-2xs cursor-pointer"
                        title="Inspect Meeting Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => onCancel(meeting)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-rose-700 hover:border-rose-300 hover:bg-rose-50/40 transition-all shadow-2xs cursor-pointer"
                          title="Cancel Meeting"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MyMeetingTable;
