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
} from "lucide-react";
import { Meeting, MeetingStatus, AttendeeResponseStatus, User } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MeetingTableProps {
  meetings: Meeting[];
  loading: boolean;
  isAdmin: boolean;
  currentUser?: User | null;
  actionLoading: boolean;
  selectedMeetingIds: Set<number>;
  onToggleSelectMeeting: (meetingId: number) => void;
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
  onViewMeeting: (meeting: Meeting) => void;
  onApproveMeeting: (meetingId: number) => void;
  onRequestCancelMeeting: (meeting: Meeting) => void;
  onRSVP?: (meetingId: number, status: AttendeeResponseStatus) => void;
}

export function MeetingTable({
  meetings,
  loading,
  isAdmin,
  currentUser,
  actionLoading,
  selectedMeetingIds,
  onToggleSelectMeeting,
  onToggleSelectAll,
  isAllSelected,
  onViewMeeting,
  onApproveMeeting,
  onRequestCancelMeeting,
  onRSVP,
}: MeetingTableProps) {
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
        month: "short",
        day: "numeric",
        year: "numeric",
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

      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      const duration = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;

      return { dateStr, timeRange: `${startTimeStr} – ${endTimeStr}`, duration };
    } catch {
      return {
        dateStr: startIso.slice(0, 10),
        timeRange: `${startIso.slice(11, 16)} – ${endIso.slice(11, 16)}`,
        duration: "",
      };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              {isAdmin && (
                <th className="p-3 pl-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    disabled={loading || meetings.length === 0}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                    title="Select All"
                  />
                </th>
              )}
              <th className="p-3 pl-4 font-bold text-slate-700">Meeting & Purpose</th>
              <th className="p-3 font-bold text-slate-700">Schedule</th>
              <th className="p-3 font-bold text-slate-700">Room Facility</th>
              <th className="p-3 font-bold text-slate-700">Logistics</th>
              <th className="p-3 font-bold text-slate-700">Status</th>
              <th className="p-3 pr-4 text-right font-bold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600 font-normal">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`loading-row-${idx}`} className="animate-pulse">
                  {isAdmin && <td className="p-3 pl-4"><div className="w-4 h-4 bg-slate-200 rounded" /></td>}
                  <td className="p-3 pl-4"><div className="h-4 bg-slate-200 rounded w-48 mb-1.5" /><div className="h-3 bg-slate-100 rounded w-32" /></td>
                  <td className="p-3"><div className="h-3.5 bg-slate-200 rounded w-28 mb-1" /><div className="h-3 bg-slate-100 rounded w-20" /></td>
                  <td className="p-3"><div className="h-3.5 bg-slate-200 rounded w-24 mb-1" /><div className="h-3 bg-slate-100 rounded w-16" /></td>
                  <td className="p-3"><div className="h-3.5 bg-slate-200 rounded w-32" /></td>
                  <td className="p-3"><div className="h-5 bg-slate-200 rounded-full w-20" /></td>
                  <td className="p-3 pr-4 text-right"><div className="h-7 bg-slate-200 rounded-lg w-16 ml-auto" /></td>
                </tr>
              ))
            ) : meetings.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No meetings found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or schedule a new meeting.</p>
                  </div>
                </td>
              </tr>
            ) : (
              meetings.map((m) => {
                const isSelected = selectedMeetingIds.has(m.meetingId);
                const schedule = formatSchedule(m.startTime, m.endTime);
                const isOrganizer = m.organizer?.userId === currentUser?.userId;
                const userAttendee = m.attendees?.find((a) => a.userId === currentUser?.userId);
                const materialCount = m.materials?.length || 0;
                const staffCount = m.staffAssignments?.length || 0;
                const attendeeCount = m.attendees?.length || 0;

                return (
                  <tr
                    key={m.meetingId}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    {isAdmin && (
                      <td className="p-3 pl-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelectMeeting(m.meetingId)}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Title & Organizer */}
                    <td className="p-3 pl-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onViewMeeting(m)}
                            className="font-bold text-slate-900 hover:text-indigo-600 text-left transition-colors cursor-pointer"
                          >
                            {m.title}
                          </button>
                          {isOrganizer && (
                            <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold">
                              You organized
                            </span>
                          )}
                        </div>
                        {m.purpose && (
                          <p className="text-slate-500 text-[11px] line-clamp-1 max-w-xs mt-0.5">
                            {m.purpose}
                          </p>
                        )}
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          By: {m.organizer?.name || "System"}
                        </span>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 font-mono text-[11px]">
                          {schedule.dateStr}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                          <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span>{schedule.timeRange}</span>
                          {schedule.duration && (
                            <span className="px-1 py-0.2 rounded bg-slate-100 text-[9px] font-bold text-slate-600">
                              {schedule.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Room */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-800">{m.room?.name || "Unassigned"}</p>
                          <p className="text-[10px] text-slate-400">{m.room?.location || "No location"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Logistics Breakdown */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Attendees */}
                        <span
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                          title={`${attendeeCount} Attendees invited`}
                        >
                          <Users className="w-3 h-3 text-slate-400" />
                          <span className="font-mono">{attendeeCount}</span>
                        </span>

                        {/* Equipment */}
                        {materialCount > 0 && (
                          <span
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-50 border border-cyan-200/80 text-cyan-700 text-[11px] font-medium"
                            title={`${materialCount} Equipment items allocated`}
                          >
                            <Package className="w-3 h-3 text-cyan-600" />
                            <span className="font-mono">{materialCount}</span>
                          </span>
                        )}

                        {/* Staff */}
                        {staffCount > 0 && (
                          <span
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-violet-50 border border-violet-200/80 text-violet-700 text-[11px] font-medium"
                            title={`${staffCount} Staff members assigned`}
                          >
                            <UserCheck className="w-3 h-3 text-violet-600" />
                            <span className="font-mono">{staffCount}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3 whitespace-nowrap">
                      {getStatusBadge(m.status)}
                    </td>

                    {/* Actions */}
                    <td className="p-3 pr-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 justify-end">
                        {/* View Details */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onViewMeeting(m)}
                          className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          title="View Meeting Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        {/* Quick Approve (Admin only, when Pending) */}
                        {isAdmin && m.status === "PENDING" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onApproveMeeting(m.meetingId)}
                            disabled={actionLoading}
                            className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            title="Approve Meeting"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          </Button>
                        )}

                        {/* Quick Cancel (When Pending or Confirmed) */}
                        {(isAdmin || isOrganizer) &&
                          (m.status === "PENDING" || m.status === "CONFIRMED") && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => onRequestCancelMeeting(m)}
                              disabled={actionLoading}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Cancel Meeting"
                            >
                              <Ban className="w-3.5 h-3.5 text-rose-500" />
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
