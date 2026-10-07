"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { User, Meeting, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { EmployeeWelcomeHeader } from "./EmployeeWelcomeHeader";
import { EmployeePendingAlert } from "./EmployeePendingAlert";
import { EmployeeKPICards } from "./EmployeeKPICards";
import { EmployeeTodaySchedule } from "./EmployeeTodaySchedule";
import { EmployeeQuickActions } from "./EmployeeQuickActions";
import { MeetingDetailsModal } from "@/components/meetings/MeetingDetailsModal";
import { BookingModal } from "@/components/BookingModal";

export function EmployeeDashboardView() {
  const { user: authUser } = useAuth();
  const toast = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(authUser);
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected meeting for modal inspection
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Load telemetry data from dynamic APIs
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [meetingsData, usersData] = await Promise.all([
        api.meetings.getAll().catch(() => []),
        api.users.getAll().catch(() => []),
      ]);

      setAllMeetings(meetingsData || []);
      setAllUsers(usersData || []);

      if (authUser) {
        setCurrentUser(authUser);
      } else if (usersData && usersData.length > 0) {
        const emp = usersData.find((u) => u.role === "EMPLOYEE") || usersData[0];
        setCurrentUser(emp);
      }
    } catch {
      toast.error("Data Load Error", "Error loading employee dashboard data");
    } finally {
      setLoading(false);
    }
  }, [authUser, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derive meetings where current user is an attendee or organizer
  const myAttendingMeetings = useMemo(() => {
    if (!currentUser?.userId) return [];
    return allMeetings.filter((m) =>
      m.attendees?.some((a) => a.userId === currentUser.userId) ||
      m.organizer?.userId === currentUser.userId
    );
  }, [allMeetings, currentUser?.userId]);

  // Derive pending RSVP invitations count
  const pendingRsvpCount = useMemo(() => {
    if (!currentUser?.userId) return 0;
    return myAttendingMeetings.filter((m) =>
      m.attendees?.some(
        (a) => a.userId === currentUser.userId && a.responseStatus === "PENDING"
      )
    ).length;
  }, [myAttendingMeetings, currentUser?.userId]);

  // Derive confirmed attendances count
  const totalConfirmedCount = useMemo(() => {
    if (!currentUser?.userId) return 0;
    return myAttendingMeetings.filter((m) =>
      m.attendees?.some(
        (a) => a.userId === currentUser.userId && a.responseStatus === "ACCEPTED"
      )
    ).length;
  }, [myAttendingMeetings, currentUser?.userId]);

  // Today's meetings for this user
  const todayMeetings = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return myAttendingMeetings
      .filter((m) => m.startTime && m.startTime.startsWith(todayStr))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [myAttendingMeetings]);

  // Colleagues count in current user's department
  const colleaguesCount = useMemo(() => {
    if (!currentUser?.departmentId) return allUsers.length;
    return allUsers.filter((u) => u.departmentId === currentUser.departmentId).length;
  }, [allUsers, currentUser?.departmentId]);

  const handleOpenMeetingDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setDetailsModalOpen(true);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Welcome & Sync Header */}
      <EmployeeWelcomeHeader
        currentUser={currentUser}
        onRefresh={loadData}
        loading={loading}
        onOpenBooking={() => setBookingModalOpen(true)}
      />

      {/* 2. Pending RSVP Callout Banner */}
      <EmployeePendingAlert pendingCount={pendingRsvpCount} />

      {/* 3. Dynamic KPI Metrics */}
      <EmployeeKPICards
        pendingRsvpCount={pendingRsvpCount}
        todayMeetingsCount={todayMeetings.length}
        totalConfirmedCount={totalConfirmedCount}
        colleaguesCount={colleaguesCount}
      />

      {/* 4. Today's Agenda Feed */}
      <div data-tour="agenda-feed">
        <EmployeeTodaySchedule
          todayMeetings={todayMeetings}
          currentUser={currentUser}
          onSelectMeeting={handleOpenMeetingDetails}
        />
      </div>

      {/* 5. Quick Actions */}
      <EmployeeQuickActions
        currentUser={currentUser}
        onOpenBooking={() => setBookingModalOpen(true)}
      />

      {/* Meeting Details Modal */}
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

export default EmployeeDashboardView;
