"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { api, Meeting, AttendeeResponseStatus } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  InvitationHeader,
  InvitationStatsCards,
  InvitationFilterBar,
  InvitationTable,
  InvitationCardGrid,
  InvitationStatusFilter,
  InvitationSortField,
  InvitationSortOrder,
  InvitationViewMode,
  InvitationStats,
} from "@/components/organizer/invitations";
import { MeetingDetailsModal } from "@/components/meetings/MeetingDetailsModal";

export default function MyInvitationsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvitationStatusFilter>("ALL");
  const [sortField, setSortField] = useState<InvitationSortField>("startTime");
  const [sortOrder, setSortOrder] = useState<InvitationSortOrder>("asc");
  const [viewMode, setViewMode] = useState<InvitationViewMode>("table");

  // Inspection Modal
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const allMeetings = await api.meetings.getAll();
      setMeetings(allMeetings || []);
    } catch {
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extract invitations where the user is an attendee
  const myInvitations = useMemo(() => {
    if (!user?.userId) {
      // If user isn't loaded yet, show meetings with any attendee list for visualization
      return meetings.map((m) => ({
        meeting: m,
        rsvpStatus: (m.attendees?.[0]?.responseStatus || "PENDING") as AttendeeResponseStatus,
      }));
    }

    const currentUserId = user.userId;
    return meetings
      .filter((m) => m.attendees?.some((a) => a.userId === currentUserId))
      .map((m) => {
        const attendeeRecord = m.attendees?.find((a) => a.userId === currentUserId);
        return {
          meeting: m,
          rsvpStatus: (attendeeRecord?.responseStatus || "PENDING") as AttendeeResponseStatus,
        };
      });
  }, [meetings, user?.userId]);

  // Compute Stats
  const stats: InvitationStats = useMemo(() => {
    return {
      total: myInvitations.length,
      pending: myInvitations.filter((i) => i.rsvpStatus === "PENDING").length,
      accepted: myInvitations.filter((i) => i.rsvpStatus === "ACCEPTED").length,
      declined: myInvitations.filter((i) => i.rsvpStatus === "DECLINED").length,
    };
  }, [myInvitations]);

  // Filter and Sort Invitations
  const filteredInvitations = useMemo(() => {
    return myInvitations
      .filter(({ meeting, rsvpStatus }) => {
        // Status Filter
        if (statusFilter !== "ALL" && rsvpStatus !== statusFilter) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = meeting.title?.toLowerCase().includes(query);
          const matchPurpose = meeting.purpose?.toLowerCase().includes(query);
          const matchRoom = meeting.room?.name?.toLowerCase().includes(query);
          const matchOrg = meeting.organizer?.name?.toLowerCase().includes(query);
          if (!matchTitle && !matchPurpose && !matchRoom && !matchOrg) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = "";
        let valB: any = "";

        if (sortField === "startTime") {
          valA = new Date(a.meeting.startTime).getTime();
          valB = new Date(b.meeting.startTime).getTime();
        } else if (sortField === "title") {
          valA = a.meeting.title?.toLowerCase() || "";
          valB = b.meeting.title?.toLowerCase() || "";
        } else if (sortField === "organizer") {
          valA = a.meeting.organizer?.name?.toLowerCase() || "";
          valB = b.meeting.organizer?.name?.toLowerCase() || "";
        } else if (sortField === "rsvpStatus") {
          valA = a.rsvpStatus || "";
          valB = b.rsvpStatus || "";
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [myInvitations, statusFilter, searchQuery, sortField, sortOrder]);

  // RSVP Action Handler
  const handleRSVP = async (meetingId: number, status: AttendeeResponseStatus) => {
    const effectiveUserId = user?.userId || 2;
    setActionLoading(true);
    try {
      await api.meetings.updateRSVP(meetingId, effectiveUserId, status);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to update RSVP status.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <InvitationHeader
        loading={loading}
        totalCount={stats.total}
        pendingCount={stats.pending}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={loadData}
      />

      {/* KPI Stats Cards */}
      <InvitationStatsCards
        stats={stats}
        currentFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      {/* Search and Filters */}
      <InvitationFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onResetFilters={() => {
          setSearchQuery("");
          setStatusFilter("ALL");
        }}
      />

      {/* Main View: Table or Card Grid */}
      {viewMode === "table" ? (
        <InvitationTable
          invitations={filteredInvitations}
          loading={loading}
          onInspect={(m) => {
            setSelectedMeeting(m);
            setDetailsModalOpen(true);
          }}
          onRSVP={handleRSVP}
          actionLoading={actionLoading}
        />
      ) : (
        <InvitationCardGrid
          invitations={filteredInvitations}
          loading={loading}
          onInspect={(m) => {
            setSelectedMeeting(m);
            setDetailsModalOpen(true);
          }}
          onRSVP={handleRSVP}
          actionLoading={actionLoading}
        />
      )}

      {/* Inspection Modal */}
      <MeetingDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedMeeting(null);
        }}
        meeting={selectedMeeting}
        isAdmin={false}
        currentUser={user}
        actionLoading={actionLoading}
        onApprove={() => {}}
        onRequestCancel={() => {}}
        onRSVP={handleRSVP}
      />
    </div>
  );
}
