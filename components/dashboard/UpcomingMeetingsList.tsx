"use client";

import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Eye,
  Package,
  UserCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Meeting } from "@/lib/api";
import { UpcomingMeetingsListProps } from "./types";

export function UpcomingMeetingsList({
  meetings,
  loading,
  onViewMeeting,
  onViewAllMeetings,
  onScheduleMeeting,
}: UpcomingMeetingsListProps) {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "confirmed";
      case "PENDING":
        return "pending";
      case "CANCELLED":
        return "cancelled";
      case "COMPLETED":
        return "completed";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Upcoming Meetings Schedule
          </h3>
          <p className="text-[11px] text-slate-500">
            Next 7 days schedule across all conference rooms
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAllMeetings}
          className="h-7.5 px-2.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          View All Meetings
        </Button>
      </div>

      {/* List / Loading / Empty states */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
            <span className="text-xs font-medium">Fetching schedule...</span>
          </div>
        ) : !meetings || meetings.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 bg-white border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Calendar className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              No Upcoming Meetings
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no confirmed or pending meetings scheduled for the next 7 days.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4 h-8 text-xs font-semibold px-4"
              onClick={onScheduleMeeting}
            >
              Book a Room Now
            </Button>
          </Card>
        ) : (
          meetings.map((meeting: Meeting) => {
            const startDate = new Date(meeting.startTime);
            const endDate = new Date(meeting.endTime);
            const monthStr = startDate.toLocaleDateString([], { month: "short" });
            const dayNum = startDate.getDate();
            const timeStr = `${startDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })} - ${endDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`;

            return (
              <div
                key={meeting.meetingId}
                onClick={() => onViewMeeting(meeting)}
                className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs cursor-pointer group select-none"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Date Badge */}
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/90 flex flex-col items-center justify-center text-center shrink-0 group-hover:bg-indigo-100/60 transition-colors">
                    <span className="text-[9px] font-bold text-indigo-600 uppercase leading-none">
                      {monthStr}
                    </span>
                    <span className="text-sm font-extrabold text-indigo-950 leading-tight">
                      {dayNum}
                    </span>
                  </div>

                  {/* Meeting Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors truncate">
                        {meeting.title}
                      </h4>
                      <Badge
                        size="sm"
                        variant={getBadgeVariant(meeting.status)}
                      >
                        {meeting.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        {timeStr}
                      </span>

                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{meeting.room?.name || "Unassigned Room"}</span>
                      </span>

                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400 shrink-0" />
                        {meeting.attendees?.length || 0} attendees
                      </span>

                      {/* Equipment Pill */}
                      {meeting.materials && meeting.materials.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          <Package className="w-2.5 h-2.5 text-slate-400" />
                          {meeting.materials.length} gear
                        </span>
                      )}

                      {/* Staff Pill */}
                      {meeting.staffAssignments && meeting.staffAssignments.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          <UserCheck className="w-2.5 h-2.5 text-slate-400" />
                          {meeting.staffAssignments.length} staff
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center justify-end shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7.5 px-2.5 bg-slate-50 hover:bg-white border-slate-200 group-hover:border-indigo-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewMeeting(meeting);
                    }}
                    leftIcon={<Eye className="w-3 h-3 text-slate-500" />}
                  >
                    Quick View
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
