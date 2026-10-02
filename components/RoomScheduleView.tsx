"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Layers,
  Wrench,
  Plus,
  RefreshCw,
  Filter,
  Eye,
  Check,
  Ban,
  UserCheck,
} from "lucide-react";
import { api, Meeting, Room, User, MeetingStatus } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface RoomScheduleViewProps {
  currentUser?: User | null;
  onBookSlot?: (roomId: number, date: string, startTime: string, endTime: string) => void;
  onNavigateToMeetings?: () => void;
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export function RoomScheduleView({
  currentUser = null,
  onBookSlot,
  onNavigateToMeetings,
}: RoomScheduleViewProps = {}) {
  const toast = useToast();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const effectiveUser = currentUser || authUser;

  const handleBookSlot = (roomId: number, date: string, startTime: string, endTime: string) => {
    if (onBookSlot) {
      onBookSlot(roomId, date, startTime, endTime);
    } else {
      router.push(`/admin/dashboard?tab=booking&roomId=${roomId}&date=${date}&startTime=${startTime}&endTime=${endTime}`);
    }
  };
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [viewMode, setViewMode] = useState<"timeline" | "agenda">("timeline");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [filterRoomId, setFilterRoomId] = useState<string>("ALL");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Load Rooms & Meetings for Selected Date
  const loadScheduleData = async () => {
    setLoading(true);
    try {
      const startOfDay = `${selectedDate}T00:00:00`;
      const endOfDay = `${selectedDate}T23:59:59`;

      const [roomsData, meetingsData] = await Promise.all([
        api.rooms.getAll(),
        api.meetings.getCalendar(startOfDay, endOfDay),
      ]);

      setRooms(roomsData);
      setMeetings(meetingsData);
    } catch {
      toast.error("Failed to load schedule", "Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduleData();
  }, [selectedDate]);

  // Date Navigation Helpers
  const handlePrevDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  // Filtered Rooms
  const filteredRooms = useMemo(() => {
    if (filterRoomId === "ALL") return rooms;
    return rooms.filter((r) => r.roomId === Number(filterRoomId));
  }, [rooms, filterRoomId]);

  // Format date display
  const formattedDateTitle = useMemo(() => {
    try {
      const parts = selectedDate.split("-");
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Meeting position calculation for timeline (relative to 08:00 - 18:00 = 10 hours)
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
        return "bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100 shadow-xs";
      case "PENDING":
        return "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 shadow-xs";
      case "CANCELLED":
        return "bg-rose-50 border-rose-200 text-rose-700 line-through opacity-70";
      case "COMPLETED":
        return "bg-slate-100 border-slate-200 text-slate-700";
      default:
        return "bg-indigo-50 border-indigo-200 text-indigo-900";
    }
  };

  // Admin Approval Action
  const handleApprove = async (meetingId: number) => {
    setActionLoading(true);
    try {
      await api.meetings.approve(meetingId);
      toast.success("Meeting Approved", "The booking is now confirmed.");
      setSelectedMeeting(null);
      await loadScheduleData();
    } catch {
      toast.error("Approval Failed", "Could not approve the meeting.");
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Meeting Action
  const handleConfirmCancel = async () => {
    if (!selectedMeeting) return;
    setActionLoading(true);
    try {
      await api.meetings.cancel(selectedMeeting.meetingId, cancelReason);
      toast.success("Meeting Cancelled", "Equipment stock has been restored.");
      setCancelModalOpen(false);
      setCancelReason("");
      setSelectedMeeting(null);
      await loadScheduleData();
    } catch {
      toast.error("Cancellation Failed", "Could not cancel meeting.");
    } finally {
      setActionLoading(false);
    }
  };

  // RSVP Action
  const handleRSVP = async (status: "ACCEPTED" | "DECLINED") => {
    if (!selectedMeeting || !currentUser) return;
    setActionLoading(true);
    try {
      await api.meetings.updateRSVP(selectedMeeting.meetingId, currentUser.userId, status);
      toast.success(
        status === "ACCEPTED" ? "RSVP Accepted" : "RSVP Declined",
        `Your response has been recorded.`
      );
      // Refresh current meeting details
      const updated = await api.meetings.getById(selectedMeeting.meetingId);
      setSelectedMeeting(updated);
      await loadScheduleData();
    } catch {
      toast.error("RSVP Failed", "Could not update your attendance status.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Schedule Top Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Day Navigation */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevDay}
              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="h-8 px-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextDay}
              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Date Picker Input */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
            />
          </div>

          <span className="text-sm font-bold text-slate-900 hidden sm:inline-block ml-1">
            {formattedDateTitle}
          </span>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Room Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={filterRoomId}
              onChange={(e) => setFilterRoomId(e.target.value)}
              className="h-9 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500 shadow-xs"
            >
              <option value="ALL">All Rooms ({rooms.length})</option>
              {rooms.map((room) => (
                <option key={room.roomId} value={room.roomId}>
                  {room.name} (Cap: {room.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === "timeline"
                  ? "bg-white text-indigo-600 font-bold shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === "agenda"
                  ? "bg-white text-indigo-600 font-bold shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Agenda
            </button>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={loadScheduleData}
            isLoading={loading}
            className="h-9 w-9 p-0"
            aria-label="Refresh Schedule"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
            <span className="font-medium text-slate-700">Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
            <span className="font-medium text-slate-700">Pending Approval (Cap &ge; 20)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="font-medium text-slate-700">Free / Available</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 italic hidden sm:block">
          💡 Click any empty slot to book directly, or click a meeting to view details.
        </p>
      </div>

      {/* VIEW MODE 1: TIMELINE GRID */}
      {viewMode === "timeline" && (
        <Card className="overflow-x-auto border-slate-200 bg-white p-0 shadow-xs">
          <div className="min-w-[900px]">
            {/* Header: Hourly Timeline Columns */}
            <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/80 sticky top-0 z-20">
              <div className="col-span-3 p-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-200">
                Conference Rooms
              </div>
              <div className="col-span-9 grid grid-cols-10 text-[11px] font-bold text-slate-600">
                {HOURS.slice(0, 10).map((hour) => (
                  <div
                    key={hour}
                    className="p-3.5 text-center border-r border-slate-200/80 last:border-r-0"
                  >
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                ))}
              </div>
            </div>

            {/* Room Rows */}
            {filteredRooms.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No rooms found matching the criteria.
              </div>
            ) : (
              filteredRooms.map((room) => {
                const roomMeetings = meetings.filter((m) => m.room?.roomId === room.roomId);

                return (
                  <div
                    key={room.roomId}
                    className="grid grid-cols-12 border-b border-slate-200/80 hover:bg-slate-50/50 transition-colors relative min-h-[90px]"
                  >
                    {/* Room Info Cell */}
                    <div className="col-span-3 p-3.5 border-r border-slate-200 flex flex-col justify-center gap-1.5 bg-slate-50/30">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {room.name}
                        </span>
                        <Badge
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
                          {room.location}
                        </span>
                        <span className="flex items-center gap-1 shrink-0 font-medium">
                          <Users className="w-3 h-3 text-slate-400 shrink-0" />
                          {room.capacity} seats
                        </span>
                      </div>
                    </div>

                    {/* Timeline Hours Background Grid & Clickable Slots */}
                    <div className="col-span-9 relative grid grid-cols-10 h-full">
                      {HOURS.slice(0, 10).map((hour) => {
                        const startHourStr = `${hour.toString().padStart(2, "0")}:00`;
                        const endHourStr = `${(hour + 1).toString().padStart(2, "0")}:00`;

                        return (
                          <div
                            key={hour}
                            onClick={() => {
                              if (room.status === "ACTIVE") {
                                handleBookSlot(room.roomId, selectedDate, startHourStr, endHourStr);
                              } else {
                                toast.warning("Room Unavailable", `${room.name} is currently under maintenance.`);
                              }
                            }}
                            className="border-r border-slate-100 h-full min-h-[90px] p-1 relative group cursor-pointer hover:bg-indigo-50/60 transition-colors"
                            title={`Click to book ${room.name} at ${startHourStr} - ${endHourStr}`}
                          >
                            <div className="hidden group-hover:flex items-center justify-center h-full w-full">
                              <span className="p-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                                <Plus className="w-3.5 h-3.5" />
                              </span>
                            </div>
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
                              setSelectedMeeting(m);
                            }}
                            style={style}
                            className={`absolute top-2 bottom-2 rounded-xl border p-2 flex flex-col justify-between overflow-hidden cursor-pointer shadow-xs transition-all hover:scale-[1.01] hover:z-30 ${statusClass}`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs truncate leading-tight">
                                {m.title}
                              </span>
                              <span className="text-[10px] font-mono px-1 rounded bg-white/70 border border-black/10 shrink-0 font-medium">
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
      )}

      {/* VIEW MODE 2: AGENDA LIST */}
      {viewMode === "agenda" && (
        <div className="space-y-3">
          {meetings.length === 0 ? (
            <Card className="p-12 text-center border-slate-200 bg-white">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-800 font-bold text-base">No meetings scheduled for this day</p>
              <p className="text-slate-500 text-xs mt-1">
                Select a different date or click below to schedule a new meeting.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleBookSlot(rooms[0]?.roomId || 1, selectedDate, "09:00", "10:00")}
                className="mt-4 gap-2"
              >
                <Plus className="w-4 h-4" />
                Book Meeting Now
              </Button>
            </Card>
          ) : (
            meetings.map((m) => {
              const startTimeShort = m.startTime.includes("T")
                ? m.startTime.split("T")[1].slice(0, 5)
                : m.startTime.slice(11, 16);
              const endTimeShort = m.endTime.includes("T")
                ? m.endTime.split("T")[1].slice(0, 5)
                : m.endTime.slice(11, 16);

              return (
                <Card
                  key={m.meetingId}
                  onClick={() => setSelectedMeeting(m)}
                  className="p-4 sm:p-5 border-slate-200 bg-white hover:border-indigo-300 transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            m.status === "CONFIRMED"
                              ? "confirmed"
                              : m.status === "PENDING"
                              ? "pending"
                              : m.status === "CANCELLED"
                              ? "cancelled"
                              : "completed"
                          }
                        >
                          {m.status}
                        </Badge>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {m.title}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          {startTimeShort} - {endTimeShort}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {m.room?.name} ({m.room?.location})
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {m.attendees?.length || 0} attendees
                        </span>
                        <span>Organized by: <strong className="text-slate-800">{m.organizer?.name}</strong></span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5 text-xs text-slate-700 group-hover:border-indigo-300"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* MEETING DETAILS INSPECTION MODAL */}
      <Modal
        isOpen={!!selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
        title={selectedMeeting?.title || "Meeting Details"}
        description={
          selectedMeeting?.purpose || "Complete session breakdown, logistics, and participants."
        }
        maxWidth="lg"
      >
        {selectedMeeting && (
          <div className="space-y-6">
            {/* Status & Timing Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Session Status
                </span>
                <div>
                  <Badge
                    variant={
                      selectedMeeting.status === "CONFIRMED"
                        ? "confirmed"
                        : selectedMeeting.status === "PENDING"
                        ? "pending"
                        : selectedMeeting.status === "CANCELLED"
                        ? "cancelled"
                        : "completed"
                    }
                  >
                    {selectedMeeting.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Time & Date
                </span>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  {selectedMeeting.startTime.replace("T", " ").slice(0, 16)} &rarr;{" "}
                  {selectedMeeting.endTime.replace("T", " ").slice(11, 16)}
                </p>
              </div>
            </div>

            {/* Room & Organizer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Location & Facility
                </span>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  {selectedMeeting.room?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedMeeting.room?.location} &bull; Capacity: {selectedMeeting.room?.capacity}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Meeting Organizer
                </span>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-violet-600" />
                  {selectedMeeting.organizer?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedMeeting.organizer?.email} &bull; {selectedMeeting.organizer?.role}
                </p>
              </div>
            </div>

            {/* Attendees Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Invited Attendees ({selectedMeeting.attendees?.length || 0})
                </h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {selectedMeeting.attendees?.map((att) => (
                  <div
                    key={att.userId}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs shadow-xs"
                  >
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 truncate">{att.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{att.email}</p>
                    </div>
                    <Badge
                      variant={
                        att.responseStatus === "ACCEPTED"
                          ? "confirmed"
                          : att.responseStatus === "DECLINED"
                          ? "cancelled"
                          : "pending"
                      }
                    >
                      {att.responseStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Materials & Logistics */}
            {selectedMeeting.materials && selectedMeeting.materials.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-600" />
                  Allocated Equipment & Materials
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedMeeting.materials.map((mat) => (
                    <span
                      key={mat.materialId}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 font-medium flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <strong>{mat.name}</strong> &times; {mat.quantityRequested}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Staff Assigned */}
            {selectedMeeting.staffAssignments && selectedMeeting.staffAssignments.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  Support Personnel Assigned
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedMeeting.staffAssignments.map((st) => (
                    <span
                      key={st.staffId}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-medium flex items-center gap-2"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <strong>{st.name}</strong> ({st.role})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Current User Attendance RSVP controls */}
            {currentUser &&
              selectedMeeting.status !== "CANCELLED" &&
              selectedMeeting.attendees?.some((a) => a.userId === currentUser.userId) && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Your Attendance Status</p>
                    <p className="text-[11px] text-slate-600">
                      You are invited to this meeting. Please submit your RSVP.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRSVP("DECLINED")}
                      isLoading={actionLoading}
                      className="text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRSVP("ACCEPTED")}
                      isLoading={actionLoading}
                      className="text-xs"
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              )}

            {/* Action Buttons: Admin Approve, Cancel Meeting */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {currentUser?.role === "ADMIN" && selectedMeeting.status === "PENDING" ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApprove(selectedMeeting.meetingId)}
                  isLoading={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 gap-1.5 text-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve Boardroom Meeting
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {selectedMeeting.status !== "CANCELLED" &&
                  (currentUser?.role === "ADMIN" ||
                    currentUser?.userId === selectedMeeting.organizer?.userId) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCancelModalOpen(true)}
                      className="text-xs border-rose-200 text-rose-700 hover:bg-rose-50 gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Cancel Meeting
                    </Button>
                  )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedMeeting(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* CANCEL MEETING CONFIRMATION MODAL */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Meeting Booking"
        description="Are you sure you want to cancel this meeting? All reserved equipment inventory will be immediately restored."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Cancellation Reason (Optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g., Client rescheduled, emergency conflicts..."
              className="w-full h-24 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 resize-none shadow-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              className="text-xs"
            >
              Back
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancel}
              isLoading={actionLoading}
              className="text-xs gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
