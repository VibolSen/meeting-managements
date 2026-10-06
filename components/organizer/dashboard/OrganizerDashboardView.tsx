"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, Meeting, DashboardSummary, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { OrganizerKPICards } from "./OrganizerKPICards";
import { OrganizerQuickActions } from "./OrganizerQuickActions";
import { OrganizerUpcomingFeed } from "./OrganizerUpcomingFeed";
import { MeetingDetailsModal } from "@/components/meetings/MeetingDetailsModal";
import { Sparkles, RefreshCw, Plus, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrganizerDashboardViewProps {
  initialUser?: User | null;
}

export function OrganizerDashboardView({ initialUser }: OrganizerDashboardViewProps) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const currentUser = initialUser || authUser;

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [organizedMeetings, setOrganizedMeetings] = useState<Meeting[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);

  const currentDateStr = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  // Modal Inspection
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      // Fetch summary and all meetings concurrently
      const [summaryRes, allMeetingsRes] = await Promise.allSettled([
        api.dashboard.getSummary(),
        api.meetings.getAll(),
      ]);

      if (summaryRes.status === "fulfilled") {
        setDashboardSummary(summaryRes.value);
      }

      if (allMeetingsRes.status === "fulfilled") {
        const allMeetings = allMeetingsRes.value || [];
        if (currentUser?.userId) {
          const myMeetings = allMeetings.filter(
            (m) => m.organizer?.userId === currentUser.userId
          );
          setOrganizedMeetings(myMeetings);
        } else {
          // If no specific user is logged in, show all or default
          setOrganizedMeetings(allMeetings);
        }
      } else if (summaryRes.status === "rejected") {
        throw new Error("Unable to connect to backend API server.");
      }
    } catch (err: any) {
      setApiError(
        err?.message ||
          "Could not connect to backend API (http://localhost:8080/api). Please ensure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser?.userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived KPIs
  const totalOrganized = organizedMeetings.length;
  const confirmedCount = organizedMeetings.filter((m) => m.status === "CONFIRMED").length;
  const pendingCount = organizedMeetings.filter((m) => m.status === "PENDING").length;
  const availableRooms = dashboardSummary?.activeRooms ?? 0;

  // Upcoming Meetings Feed (future meetings, sorted ascending)
  const upcomingMeetings = [...organizedMeetings]
    .filter((m) => m.status !== "CANCELLED" && m.status !== "COMPLETED")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Handle meeting cancel
  const handleRequestCancel = async (meeting: Meeting) => {
    const reason = window.prompt("Please enter a cancellation reason:");
    if (reason === null) return; // user clicked cancel
    setActionLoading(true);
    try {
      await api.meetings.cancel(meeting.meetingId, reason || "Cancelled by Organizer");
      setDetailsModalOpen(false);
      setSelectedMeeting(null);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to cancel meeting.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Backend API Alert */}
      {apiError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button
            type="button"
            onClick={() => loadData()}
            className="px-3 py-1 bg-amber-200/60 hover:bg-amber-200 text-amber-950 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Welcome Header (Unified with Admin DashboardHeader Design) */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-slate-900/95 dark:via-[#111827] dark:to-slate-900/90 p-4 sm:p-5 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold">
                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>Organizer Command Center</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                •
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {currentDateStr}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome back, {currentUser?.name || "Organizer"}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                {currentUser?.role || "ORGANIZER"}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Coordinate company meetings, reserve conference rooms, assign catering and technical staff, and monitor attendee RSVPs in real time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData()}
              isLoading={loading}
              className="h-8.5 text-xs px-3 bg-white"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/organizer/book-meeting")}
              className="h-8.5 text-xs px-3.5 shadow-indigo-600/20"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Schedule Meeting
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <OrganizerKPICards
        totalOrganized={totalOrganized}
        confirmedCount={confirmedCount}
        pendingCount={pendingCount}
        availableRooms={availableRooms}
        loading={loading}
      />

      {/* Quick Actions Shortcuts */}
      <OrganizerQuickActions />

      {/* Upcoming Meetings Feed */}
      <OrganizerUpcomingFeed
        meetings={upcomingMeetings}
        loading={loading}
        onSelectMeeting={(m) => {
          setSelectedMeeting(m);
          setDetailsModalOpen(true);
        }}
        onScheduleNew={() => router.push("/organizer/book-meeting")}
      />

      {/* Meeting Details Inspection Modal */}
      <MeetingDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedMeeting(null);
        }}
        meeting={selectedMeeting}
        isAdmin={false}
        currentUser={currentUser}
        actionLoading={actionLoading}
        onApprove={() => {}} // Organizers cannot approve boardroom reservations
        onRequestCancel={handleRequestCancel}
      />
    </div>
  );
}

export default OrganizerDashboardView;
