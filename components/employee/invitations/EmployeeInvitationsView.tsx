"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Meeting, User, AttendeeResponseStatus, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { InvitationStatsCards } from "./InvitationStatsCards";
import { InvitationFilterBar, InvitationTab } from "./InvitationFilterBar";
import { InvitationCardList } from "./InvitationCardList";
import { MeetingDetailsModal } from "@/components/meetings/MeetingDetailsModal";

export function EmployeeInvitationsView() {
  const { user: authUser } = useAuth();
  const toast = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(authUser);
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<InvitationTab>("all");

  // Selected meeting for inspection
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Load all meetings
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
      toast.error("Data Load Error", "Error loading meeting invitations");
    } finally {
      setLoading(false);
    }
  }, [authUser, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle RSVP
  const handleUpdateRsvp = async (meetingId: number, status: AttendeeResponseStatus) => {
    if (!currentUser?.userId) return;
    setActionLoadingId(meetingId);
    try {
      await api.meetings.updateRSVP(meetingId, currentUser.userId, status);
      await loadData();
      toast.success("RSVP Confirmed", `Your response has been registered as ${status}`);
    } catch (err: any) {
      toast.error("RSVP Error", err?.message || "Failed to submit RSVP response");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Base list of invitations for current user
  const myInvitations = useMemo(() => {
    if (!currentUser?.userId) return [];
    return allMeetings.filter((m) =>
      m.attendees?.some((a) => a.userId === currentUser.userId)
    );
  }, [allMeetings, currentUser?.userId]);

  // Compute Conflict Map: meetingId -> conflicting accepted meeting
  const conflictsMap = useMemo(() => {
    if (!currentUser?.userId) return {};
    const conflicts: Record<number, Meeting> = {};

    // 1. Find all accepted meetings
    const acceptedMeetings = myInvitations.filter((m) => {
      if (m.status === "CANCELLED") return false;
      const att = m.attendees?.find((a) => a.userId === currentUser.userId);
      return att?.responseStatus === "ACCEPTED";
    });

    // 2. Cross-check against all other invitations
    myInvitations.forEach((invitation) => {
      const att = invitation.attendees?.find((a) => a.userId === currentUser.userId);
      if (att?.responseStatus === "ACCEPTED") return; // don't flag itself

      if (!invitation.startTime || !invitation.endTime) return;
      const invStart = new Date(invitation.startTime).getTime();
      const invEnd = new Date(invitation.endTime).getTime();

      const overlap = acceptedMeetings.find((acc) => {
        if (acc.meetingId === invitation.meetingId) return false;
        if (!acc.startTime || !acc.endTime) return false;
        const accStart = new Date(acc.startTime).getTime();
        const accEnd = new Date(acc.endTime).getTime();
        return invStart < accEnd && invEnd > accStart;
      });

      if (overlap) {
        conflicts[invitation.meetingId] = overlap;
      }
    });

    return conflicts;
  }, [myInvitations, currentUser?.userId]);

  // Filtered invitations
  const filteredInvitations = useMemo(() => {
    let result = [...myInvitations];

    // Tab filter
    if (activeTab !== "all" && currentUser?.userId) {
      result = result.filter((m) => {
        const att = m.attendees?.find((a) => a.userId === currentUser.userId);
        return att?.responseStatus === activeTab;
      });
    }

    // Search filter
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

    // Sort: pending first, then by upcoming date
    return result.sort((a, b) => {
      const aAtt = a.attendees?.find((att) => att.userId === currentUser?.userId);
      const bAtt = b.attendees?.find((att) => att.userId === currentUser?.userId);

      const aPending = aAtt?.responseStatus === "PENDING";
      const bPending = bAtt?.responseStatus === "PENDING";

      if (aPending && !bPending) return -1;
      if (!aPending && bPending) return 1;

      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  }, [myInvitations, activeTab, searchQuery, currentUser?.userId]);

  // Stats counters
  const stats = useMemo(() => {
    let pending = 0;
    let accepted = 0;
    let declined = 0;

    myInvitations.forEach((m) => {
      const att = m.attendees?.find((a) => a.userId === currentUser?.userId);
      if (att?.responseStatus === "PENDING") pending++;
      else if (att?.responseStatus === "ACCEPTED") accepted++;
      else if (att?.responseStatus === "DECLINED") declined++;
    });

    return {
      total: myInvitations.length,
      pending,
      accepted,
      declined,
    };
  }, [myInvitations, currentUser?.userId]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Header Information Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Meeting Invitations & RSVP Hub</h1>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {stats.total} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Respond to conference invitations, track confirmations, and avoid schedule conflicts.
          </p>
        </div>

        {stats.pending > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 self-start sm:self-center">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{stats.pending} Action Required</span>
          </div>
        )}
      </div>

      {/* 2. Invitation Stats Metrics */}
      <InvitationStatsCards
        pendingCount={stats.pending}
        acceptedCount={stats.accepted}
        declinedCount={stats.declined}
        totalCount={stats.total}
      />

      {/* 3. Search and Tab Filters */}
      <InvitationFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={stats.pending}
      />

      {/* 4. Invitations List with Conflict Detection */}
      <InvitationCardList
        meetings={filteredInvitations}
        currentUser={currentUser}
        conflictsMap={conflictsMap}
        onSelectMeeting={(m) => {
          setSelectedMeeting(m);
          setDetailsModalOpen(true);
        }}
        onUpdateRsvp={handleUpdateRsvp}
        actionLoadingId={actionLoadingId}
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
    </div>
  );
}

export default EmployeeInvitationsView;
