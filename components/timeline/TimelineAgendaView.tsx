"use client";

import React from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Eye,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Meeting } from "@/lib/api";
import { TimelineAgendaViewProps } from "./types";

export function TimelineAgendaView({
  meetings,
  rooms,
  selectedDate,
  onBookSlot,
  onViewMeeting,
}: TimelineAgendaViewProps) {
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

  if (meetings.length === 0) {
    return (
      <Card className="p-12 text-center border-slate-200 bg-white shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <CalendarIcon className="w-6 h-6 stroke-[1.5]" />
        </div>
        <p className="text-slate-800 font-bold text-base">
          No meetings scheduled for this day
        </p>
        <p className="text-slate-500 text-xs mt-1">
          Select a different date or click below to schedule a new reservation.
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            const defaultRoomId = rooms[0]?.roomId || 1;
            onBookSlot(defaultRoomId, selectedDate, "09:00", "10:00");
          }}
          className="mt-4 h-8 text-xs font-semibold px-3.5"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Book Meeting Now
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {meetings.map((m: Meeting) => {
        const startTimeShort = m.startTime.includes("T")
          ? m.startTime.split("T")[1].slice(0, 5)
          : m.startTime.slice(11, 16);
        const endTimeShort = m.endTime.includes("T")
          ? m.endTime.split("T")[1].slice(0, 5)
          : m.endTime.slice(11, 16);

        return (
          <Card
            key={m.meetingId}
            onClick={() => onViewMeeting(m)}
            className="p-4 sm:p-4.5 border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group shadow-xs select-none"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm" variant={getBadgeVariant(m.status)}>
                    {m.status}
                  </Badge>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {m.title}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    {startTimeShort} - {endTimeShort}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {m.room?.name || "Room"} ({m.room?.location || "TBD"})
                    </span>
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {m.attendees?.length || 0} attendees
                  </span>

                  <span className="text-slate-500">
                    Organized by:{" "}
                    <strong className="text-slate-800 font-semibold">
                      {m.organizer?.name || "Organizer"}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewMeeting(m);
                  }}
                  className="h-8 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:border-indigo-300 bg-slate-50 hover:bg-white transition-colors"
                  leftIcon={<Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600" />}
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
