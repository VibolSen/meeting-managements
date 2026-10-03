"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, Meeting, Room, User, AttendeeResponseStatus } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { MeetingDetailsModal } from "@/components/meetings/MeetingDetailsModal";
import { MeetingCancelModal } from "@/components/meetings/MeetingCancelModal";
import { BookingModal } from "@/components/BookingModal";
import {
  TimelineHeader,
  TimelineLegend,
  TimelineGrid,
  TimelineAgendaView,
  TimelineViewMode,
} from "@/components/timeline";

interface RoomScheduleViewProps {
  currentUser?: User | null;
  onBookSlot?: (roomId: number, date: string, startTime: string, endTime: string) => void;
  onNavigateToMeetings?: () => void;
}

export function RoomScheduleView({
  currentUser = null,
  onBookSlot,
  onNavigateToMeetings,
}: RoomScheduleViewProps = {}) {
  const toast = useToast();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const effectiveUser = currentUser || authUser;

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [viewMode, setViewMode] = useState<TimelineViewMode>("timeline");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [filterRoomId, setFilterRoomId] = useState<string>("ALL");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Pop-up Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSlotParams, setBookingSlotParams] = useState<{
    roomId?: number;
    date?: string;
    startTime?: string;
    endTime?: string;
  }>({});

  // Slot booking coordinator: opens pop-up modal with prefilled slot parameters
  const handleBookSlot = (
    roomId: number,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    if (onBookSlot) {
      onBookSlot(roomId, date, startTime, endTime);
    } else {
      setBookingSlotParams({ roomId, date, startTime, endTime });
      setBookingModalOpen(true);
    }
  };

  // Load Rooms & Meetings dynamically for the Selected Date
  const loadScheduleData = useCallback(async () => {
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
  }, [selectedDate, toast]);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

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

  // Formatted date string for title
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

  // Fast In-Place Admin Approval
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

  // Meeting Cancellation Action
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

  // RSVP Response Handler
  const handleRSVP = async (
    meetingId: number,
    status: AttendeeResponseStatus
  ) => {
    if (!effectiveUser) return;
    setActionLoading(true);
    try {
      await api.meetings.updateRSVP(meetingId, effectiveUser.userId, status);
      toast.success(
        status === "ACCEPTED" ? "RSVP Accepted" : "RSVP Declined",
        "Your attendance response has been recorded."
      );
      const updated = await api.meetings.getById(meetingId);
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
      {/* 1. Master Timeline Header Controls */}
      <TimelineHeader
        selectedDate={selectedDate}
        formattedDateTitle={formattedDateTitle}
        rooms={rooms}
        filterRoomId={filterRoomId}
        viewMode={viewMode}
        loading={loading}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onToday={handleToday}
        onDateChange={setSelectedDate}
        onFilterRoomChange={setFilterRoomId}
        onViewModeChange={setViewMode}
        onRefresh={loadScheduleData}
      />

      {/* 2. Status Indicators & User Hint Legend */}
      <TimelineLegend />

      {/* 3. Main Schedule View (Timeline Grid vs. Agenda List) */}
      {viewMode === "timeline" ? (
        <TimelineGrid
          rooms={filteredRooms}
          meetings={meetings}
          selectedDate={selectedDate}
          onBookSlot={handleBookSlot}
          onViewMeeting={setSelectedMeeting}
        />
      ) : (
        <TimelineAgendaView
          meetings={meetings}
          rooms={rooms}
          selectedDate={selectedDate}
          onBookSlot={handleBookSlot}
          onViewMeeting={setSelectedMeeting}
        />
      )}

      {/* 4. Shared Meeting Details Inspection Modal */}
      <MeetingDetailsModal
        isOpen={!!selectedMeeting && !cancelModalOpen}
        onClose={() => setSelectedMeeting(null)}
        meeting={selectedMeeting}
        isAdmin={effectiveUser?.role === "ADMIN"}
        currentUser={effectiveUser}
        actionLoading={actionLoading}
        onApprove={handleApprove}
        onRequestCancel={() => setCancelModalOpen(true)}
        onRSVP={handleRSVP}
      />

      {/* 5. Shared Meeting Cancellation Confirmation Modal */}
      <MeetingCancelModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setCancelReason("");
        }}
        meeting={selectedMeeting}
        cancelReason={cancelReason}
        onReasonChange={setCancelReason}
        onConfirm={handleConfirmCancel}
        loading={actionLoading}
      />

      {/* 6. Pop-up Schedule Meeting Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setBookingSlotParams({});
        }}
        currentUser={effectiveUser}
        initialRoomId={bookingSlotParams.roomId}
        initialDate={bookingSlotParams.date}
        initialStartTime={bookingSlotParams.startTime}
        initialEndTime={bookingSlotParams.endTime}
        onSuccess={() => {
          loadScheduleData();
        }}
      />
    </div>
  );
}

export default RoomScheduleView;
