"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Meeting, User, AttendeeResponseStatus, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import {
  EmployeeScheduleHeader,
  ScheduleTimeframe,
  ScheduleRsvpFilter,
} from "./EmployeeScheduleHeader";
import { EmployeeScheduleStats } from "./EmployeeScheduleStats";
import { EmployeeScheduleList } from "./EmployeeScheduleList";
import { MeetingDetailsModal } from "@/components/meetings/MeetingDetailsModal";
import { BookingModal } from "@/components/BookingModal";

export function EmployeeScheduleView() {
  const { user: authUser } = useAuth();
  const toast = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(authUser);
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState<ScheduleTimeframe>("all");
  const [rsvpFilter, setRsvpFilter] = useState<ScheduleRsvpFilter>("all");

  // Selected meeting for modal inspection
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [rsvpActionLoadingId, setRsvpActionLoadingId] = useState<number | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [meetingsData, usersData] = await Promise.all([
        api.meetings.getAll().catch(() => []),
        api.users.getAll().catch(() => []),
      ]);

      setAllMeetings(meetingsData || []);

      if (authUser) {
        setCurrentUser(authUser);
      } else if (usersData && usersData.length > 0) {
        const emp = usersData.find((u) => u.role === "EMPLOYEE") || usersData[0];
        setCurrentUser(emp);
      }
    } catch {
      toast.error("Data Load Error", "Error loading schedule data");
    } finally {
      setLoading(false);
    }
  }, [authUser, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle RSVP update
  const handleUpdateRsvp = async (meetingId: number, status: AttendeeResponseStatus) => {
    if (!currentUser?.userId) return;
    setRsvpActionLoadingId(meetingId);
    try {
      await api.meetings.updateRSVP(meetingId, currentUser.userId, status);
      await loadData();
      toast.success("RSVP Updated", `Your response has been marked as ${status}`);
    } catch (err: any) {
      toast.error("RSVP Error", err?.message || "Failed to update RSVP response");
    } finally {
      setRsvpActionLoadingId(null);
    }
  };

  // Base list of meetings user is attending or organizing
  const myAttendingMeetings = useMemo(() => {
    if (!currentUser?.userId) return [];
    return allMeetings.filter((m) =>
      m.attendees?.some((a) => a.userId === currentUser.userId) ||
      m.organizer?.userId === currentUser.userId
    );
  }, [allMeetings, currentUser?.userId]);

  // Filtered meetings according to timeframe, RSVP status, and search
  const filteredMeetings = useMemo(() => {
    let result = [...myAttendingMeetings];
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // 1. Timeframe filter
    if (timeframe === "today") {
      result = result.filter((m) => m.startTime && m.startTime.startsWith(todayStr));
    } else if (timeframe === "week") {
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      result = result.filter((m) => {
        if (!m.startTime) return false;
        const mDate = new Date(m.startTime);
        return mDate >= now && mDate <= nextWeek;
      });
    } else if (timeframe === "past") {
      result = result.filter((m) => {
        if (!m.endTime) return false;
        return new Date(m.endTime) < now;
      });
    } else if (timeframe === "all") {
      // Default: all upcoming and today
      result = result.filter((m) => {
        if (!m.endTime) return true;
        return new Date(m.endTime) >= new Date(todayStr + "T00:00:00");
      });
    }

    // 2. RSVP Filter
    if (rsvpFilter !== "all" && currentUser?.userId) {
      result = result.filter((m) => {
        const attendee = m.attendees?.find((a) => a.userId === currentUser.userId);
        return attendee?.responseStatus === rsvpFilter;
      });
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.title?.toLowerCase().includes(q) ||
          m.purpose?.toLowerCase().includes(q) ||
          m.room?.name?.toLowerCase().includes(q) ||
          m.organizer?.name?.toLowerCase().includes(q)
      );
    }

    // Chronological sort
    return result.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [myAttendingMeetings, timeframe, rsvpFilter, searchQuery, currentUser?.userId]);

  // Compute stats
  const stats = useMemo(() => {
    let accepted = 0;
    let pending = 0;
    let totalMinutes = 0;

    filteredMeetings.forEach((m) => {
      const attendee = m.attendees?.find((a) => a.userId === currentUser?.userId);
      if (attendee?.responseStatus === "ACCEPTED") accepted++;
      else if (attendee?.responseStatus === "PENDING") pending++;

      if (m.startTime && m.endTime) {
        const start = new Date(m.startTime).getTime();
        const end = new Date(m.endTime).getTime();
        if (end > start) {
          totalMinutes += (end - start) / (1000 * 60);
        }
      }
    });

    return {
      total: filteredMeetings.length,
      accepted,
      pending,
      hours: totalMinutes / 60,
    };
  }, [filteredMeetings, currentUser?.userId]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Header with Filters & Search */}
      <EmployeeScheduleHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        rsvpFilter={rsvpFilter}
        onRsvpFilterChange={setRsvpFilter}
        totalCount={filteredMeetings.length}
        onOpenBooking={() => setBookingModalOpen(true)}
        currentUser={currentUser}
      />

      {/* 2. Schedule Key Metric Counters */}
      <EmployeeScheduleStats
        totalCount={stats.total}
        acceptedCount={stats.accepted}
        pendingCount={stats.pending}
        totalHours={stats.hours}
      />

      {/* 3. Grouped Chronological Schedule Feed */}
      <EmployeeScheduleList
        meetings={filteredMeetings}
        currentUser={currentUser}
        onSelectMeeting={(m) => {
          setSelectedMeeting(m);
          setDetailsModalOpen(true);
        }}
        onUpdateRsvp={handleUpdateRsvp}
        rsvpActionLoadingId={rsvpActionLoadingId}
      />

      {/* Details Inspection Modal */}
      {selectedMeeting && (
        <MeetingDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedMeeting(null);
          }}
          meeting={selectedMeeting}
        />
      )}

      {/* Booking Popup Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        currentUser={currentUser}
        onSuccess={loadData}
      />
    </div>
  );
}

export default EmployeeScheduleView;
