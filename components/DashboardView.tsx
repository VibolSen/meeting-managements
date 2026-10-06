"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LayoutDashboard, BarChart3, CheckSquare } from "lucide-react";
import { api, DashboardSummary, User, Meeting } from "@/lib/api";
import { MeetingDetailsModal } from "@/components/meetings/MeetingDetailsModal";
import { BookingModal } from "@/components/BookingModal";
import {
  DashboardHeader,
  DashboardKpiGrid,
  UpcomingMeetingsList,
  DashboardActionCenter,
  FacilityAnalyticsView,
  MyActionItemsWidget,
} from "@/components/dashboard";

interface DashboardViewProps {
  currentUser: User | null;
  onNavigate?: (tab: "dashboard" | "booking" | "calendar" | "meetings" | "resources") => void;
}

export function DashboardView({ currentUser, onNavigate }: DashboardViewProps) {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [dashboardTab, setDashboardTab] = useState<"overview" | "analytics" | "actions">("overview");

  // In-place Meeting Details Inspection Modal
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // In-place Schedule Meeting Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await api.dashboard.getSummary();
      setSummary(data);
    } catch (err: any) {
      setApiError(err?.message || "Could not connect to backend API (http://localhost:8080/api).");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Direct Route & Tab Navigation Handler
  const handleNavigate = (pathOrTab: string) => {
    if (pathOrTab.startsWith("/")) {
      router.push(pathOrTab);
    } else if (onNavigate) {
      onNavigate(pathOrTab as any);
    }
  };

  const handleScheduleMeeting = () => {
    setBookingModalOpen(true);
  };

  const handleReviewApprovals = () => {
    router.push("/admin/meetings-approvals?status=PENDING");
  };

  const handleViewAllMeetings = () => {
    router.push("/admin/meetings-approvals");
  };

  // Fast In-Place Approval from Dashboard
  const handleApproveMeeting = async (meetingId: number) => {
    setActionLoading(true);
    try {
      await api.meetings.approve(meetingId);
      setDetailsModalOpen(false);
      setSelectedMeeting(null);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to approve meeting.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestCancel = (meeting: Meeting) => {
    setDetailsModalOpen(false);
    router.push(`/admin/meetings-approvals?cancelMeetingId=${meeting.meetingId}`);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Backend API Connection Alert */}
      {apiError && (
        <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>API Notice:</strong> {apiError} Ensure your Spring Boot backend is running.
            </span>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold cursor-pointer shrink-0 text-xs transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* 1. Welcome Banner Header */}
      <DashboardHeader
        currentUser={currentUser}
        loading={loading}
        onRefresh={loadData}
        onScheduleMeeting={handleScheduleMeeting}
      />

      {/* 2. Mode Selector: Operations vs Space Intelligence vs Action Items */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setDashboardTab("overview")}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
            dashboardTab === "overview"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Operations Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setDashboardTab("analytics")}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
            dashboardTab === "analytics"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Facility Utilization & Heatmap</span>
        </button>

        <button
          type="button"
          onClick={() => setDashboardTab("actions")}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
            dashboardTab === "actions"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>My Action Items</span>
        </button>
      </div>

      {dashboardTab === "overview" && (
        <>
          {/* 3. Interactive KPI Metrics Grid */}
          <DashboardKpiGrid
            summary={summary}
            loading={loading}
            onNavigate={handleNavigate}
          />

          {/* 4. Main Operational Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 items-start">
            {/* Left Column (2 Cols): 7-Day Upcoming Meetings Schedule */}
            <div className="lg:col-span-2">
              <UpcomingMeetingsList
                meetings={summary?.upcomingMeetings || []}
                loading={loading}
                onViewMeeting={(meeting) => {
                  setSelectedMeeting(meeting);
                  setDetailsModalOpen(true);
                }}
                onViewAllMeetings={handleViewAllMeetings}
                onScheduleMeeting={handleScheduleMeeting}
              />
            </div>

            {/* Right Column (1 Col): Action Center & Health Gauges */}
            <div className="lg:col-span-1">
              <DashboardActionCenter
                summary={summary}
                loading={loading}
                onReviewApprovals={handleReviewApprovals}
              />
            </div>
          </div>
        </>
      )}

      {dashboardTab === "analytics" && <FacilityAnalyticsView />}

      {dashboardTab === "actions" && (
        <MyActionItemsWidget
          onSelectMeetingId={(meetingId) =>
            handleNavigate(`/admin/meetings-approvals?meetingId=${meetingId}`)
          }
        />
      )}

      {/* In-Place Meeting Details & Fast Approval Modal */}
      <MeetingDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedMeeting(null);
        }}
        meeting={selectedMeeting}
        isAdmin={currentUser?.role === "ADMIN"}
        currentUser={currentUser}
        actionLoading={actionLoading}
        onApprove={handleApproveMeeting}
        onRequestCancel={handleRequestCancel}
      />

      {/* Pop-up Schedule Meeting Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        currentUser={currentUser}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}
