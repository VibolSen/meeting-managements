"use client";

import React from "react";
import { MapPin, Users, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Meeting, MeetingStatus } from "@/lib/api";
import { TimelineGridProps, TIMELINE_HOURS } from "./types";

export function TimelineGrid({
  rooms,
  meetings,
  selectedDate,
  onBookSlot,
  onViewMeeting,
}: TimelineGridProps) {
  const hours = TIMELINE_HOURS.slice(0, 10); // 8:00 to 17:00 (10 slots)

  // Meeting position calculation relative to 08:00 - 18:00 (10 hours total)
  const getMeetingStyle = (m: Meeting) => {
    const start = new Date(m.startTime);
    const end = new Date(m.endTime);

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;

    const timelineStart = 8;
    const timelineEnd = 18;
    const totalHours = timelineEnd - timelineStart;

    const clampedStart = Math.max(timelineStart, Math.min(timelineEnd, startHour));
    const clampedEnd = Math.max(timelineStart, Math.min(timelineEnd, endHour));

    const leftPercent = ((clampedStart - timelineStart) / totalHours) * 100;
    const widthPercent = Math.max(2, ((clampedEnd - clampedStart) / totalHours) * 100);

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const getStatusColor = (status: MeetingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-50/95 border-emerald-300 text-emerald-950 hover:bg-emerald-100 shadow-xs";
      case "PENDING":
        return "bg-amber-50/95 border-amber-300 text-amber-950 hover:bg-amber-100 shadow-xs";
      case "CANCELLED":
        return "bg-rose-50/90 border-rose-200 text-rose-700 line-through opacity-70";
      case "COMPLETED":
        return "bg-slate-100 border-slate-200 text-slate-700";
      default:
        return "bg-indigo-50 border-indigo-200 text-indigo-950";
    }
  };

  return (
    <Card className="overflow-x-auto border-slate-200 bg-white p-0 shadow-xs">
      <div className="min-w-[920px]">
        {/* Header: Hourly Timeline Columns */}
        <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/80 sticky top-0 z-20">
          <div className="col-span-3 p-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200">
            Conference Rooms
          </div>
          <div className="col-span-9 grid grid-cols-10 text-[11px] font-bold text-slate-600">
            {hours.map((hour) => (
              <div
                key={hour}
                className="p-3 text-center border-r border-slate-200/80 last:border-r-0"
              >
                {hour.toString().padStart(2, "0")}:00
              </div>
            ))}
          </div>
        </div>

        {/* Room Rows */}
        {rooms.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No rooms found matching the criteria.
          </div>
        ) : (
          rooms.map((room) => {
            const roomMeetings = meetings.filter(
              (m) => m.room?.roomId === room.roomId
            );

            return (
              <div
                key={room.roomId}
                className="grid grid-cols-12 border-b border-slate-200/80 hover:bg-slate-50/40 transition-colors relative min-h-[92px]"
              >
                {/* Room Info Cell */}
                <div className="col-span-3 p-3.5 border-r border-slate-200 flex flex-col justify-center gap-1.5 bg-slate-50/30">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {room.name}
                    </span>
                    <Badge
                      size="sm"
                      variant={
                        room.status === "ACTIVE"
                          ? "available"
                          : room.status === "UNDER_MAINTENANCE"
                          ? "maintenance"
                          : "neutral"
                      }
                    >
                      {room.status === "ACTIVE" ? "Ready" : "Maint."}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{room.location}</span>
                    </span>
                    <span className="flex items-center gap-1 shrink-0 font-medium">
                      <Users className="w-3 h-3 text-slate-400 shrink-0" />
                      {room.capacity} seats
                    </span>
                  </div>
                </div>

                {/* Timeline Hours Background Grid & Clickable Slots */}
                <div className="col-span-9 relative grid grid-cols-10 h-full">
                  {hours.map((hour) => {
                    const startHourStr = `${hour.toString().padStart(2, "0")}:00`;
                    const endHourStr = `${(hour + 1).toString().padStart(2, "0")}:00`;

                    return (
                      <div
                        key={hour}
                        onClick={() => {
                          if (room.status === "ACTIVE") {
                            onBookSlot(
                              room.roomId,
                              selectedDate,
                              startHourStr,
                              endHourStr
                            );
                          }
                        }}
                        className={`border-r border-slate-100 h-full min-h-[92px] p-1 relative group transition-colors ${
                          room.status === "ACTIVE"
                            ? "cursor-pointer hover:bg-indigo-50/60"
                            : "cursor-not-allowed bg-slate-50/50"
                        }`}
                        title={
                          room.status === "ACTIVE"
                            ? `Click to book ${room.name} at ${startHourStr} - ${endHourStr}`
                            : `${room.name} is currently under maintenance`
                        }
                      >
                        {room.status === "ACTIVE" && (
                          <div className="hidden group-hover:flex items-center justify-center h-full w-full">
                            <span className="p-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-xs">
                              <Plus className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Positioned Meeting Blocks */}
                  {roomMeetings.map((m) => {
                    const style = getMeetingStyle(m);
                    const statusClass = getStatusColor(m.status);

                    const startTimeShort = m.startTime.includes("T")
                      ? m.startTime.split("T")[1].slice(0, 5)
                      : m.startTime.slice(11, 16);
                    const endTimeShort = m.endTime.includes("T")
                      ? m.endTime.split("T")[1].slice(0, 5)
                      : m.endTime.slice(11, 16);

                    return (
                      <div
                        key={m.meetingId}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewMeeting(m);
                        }}
                        style={style}
                        className={`absolute top-2 bottom-2 rounded-xl border p-2 flex flex-col justify-between overflow-hidden cursor-pointer shadow-xs transition-all hover:scale-[1.01] hover:z-30 select-none ${statusClass}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs truncate leading-tight">
                            {m.title}
                          </span>
                          <span className="text-[10px] font-mono px-1 rounded bg-white/80 border border-black/10 shrink-0 font-semibold">
                            {startTimeShort} - {endTimeShort}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] opacity-90 font-medium">
                          <span className="truncate">By {m.organizer?.name || "Organizer"}</span>
                          <span className="font-bold tracking-wider text-[9px] uppercase">
                            {m.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
