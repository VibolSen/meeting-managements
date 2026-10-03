"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, Meeting, AttendeeResponseStatus } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  MyMeetingHeader,
  MyMeetingStatsCards,
  MyMeetingFilterBar,
  MyMeetingTable,
  MyMeetingCardGrid,
  MyMeetingCancelModal,
  MyMeetingPagination,
  MyMeetingStatusFilter,
  MyMeetingSortField,
  MyMeetingSortOrder,
  MyMeetingViewMode,
  MyMeetingStats,
} from "@/components/organizer/meetings";
import { MeetingDetailsModal } from "@/components/meetings/MeetingDetailsModal";

export default function MyMeetingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MyMeetingStatusFilter>("ALL");
  const [sortField, setSortField] = useState<MyMeetingSortField>("startTime");
  const [sortOrder, setSortOrder] = useState<MyMeetingSortOrder>("asc");
  const [viewMode, setViewMode] = useState<MyMeetingViewMode>("table");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [cancelModalMeeting, setCancelModalMeeting] = useState<Meeting | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const all = await api.meetings.getAll();
      if (user?.userId) {
        setMeetings(all.filter((m) => m.organizer?.userId === user.userId));
      } else {
        setMeetings(all);
      }
    } catch {
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  // Compute Stats
  const stats: MyMeetingStats = useMemo(() => {
    return {
      total: meetings.length,
      pending: meetings.filter((m) => m.status === "PENDING").length,
      confirmed: meetings.filter((m) => m.status === "CONFIRMED").length,
      completed: meetings.filter((m) => m.status === "COMPLETED").length,
      cancelled: meetings.filter((m) => m.status === "CANCELLED").length,
    };
  }, [meetings]);

  // Filtered and Sorted Meetings
  const filteredMeetings = useMemo(() => {
    return meetings
      .filter((m) => {
        // Status Filter
        if (statusFilter !== "ALL" && m.status !== statusFilter) {
          return false;
        }
        // Search Query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = m.title?.toLowerCase().includes(query);
          const matchPurpose = m.purpose?.toLowerCase().includes(query);
          const matchRoom = m.room?.name?.toLowerCase().includes(query);
          if (!matchTitle && !matchPurpose && !matchRoom) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = "";
        let valB: any = "";

        if (sortField === "startTime") {
          valA = new Date(a.startTime).getTime();
          valB = new Date(b.startTime).getTime();
        } else if (sortField === "title") {
          valA = a.title?.toLowerCase() || "";
          valB = b.title?.toLowerCase() || "";
        } else if (sortField === "room") {
          valA = a.room?.name?.toLowerCase() || "";
          valB = b.room?.name?.toLowerCase() || "";
        } else if (sortField === "status") {
          valA = a.status || "";
          valB = b.status || "";
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [meetings, statusFilter, searchQuery, sortField, sortOrder]);

  // Paginated Slices
  const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / pageSize));
  const paginatedMeetings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMeetings.slice(start, start + pageSize);
  }, [filteredMeetings, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  // Cancel Handler
  const handleConfirmCancel = async (meetingId: number, reason: string) => {
    await api.meetings.cancel(meetingId, reason);
    await loadMeetings();
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <MyMeetingHeader
        loading={loading}
        totalMeetings={stats.total}
        pendingCount={stats.pending}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={loadMeetings}
        onNewBooking={() => router.push("/organizer/book-meeting")}
      />

      {/* KPI Stats Cards (Clickable) */}
      <MyMeetingStatsCards
        stats={stats}
        currentStatusFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      {/* Search and Filters */}
      <MyMeetingFilterBar
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
        <MyMeetingTable
          meetings={paginatedMeetings}
          loading={loading}
          onInspect={(m) => {
            setSelectedMeeting(m);
            setDetailsModalOpen(true);
          }}
          onCancel={(m) => {
            setCancelModalMeeting(m);
            setCancelModalOpen(true);
          }}
        />
      ) : (
        <MyMeetingCardGrid
          meetings={paginatedMeetings}
          loading={loading}
          onInspect={(m) => {
            setSelectedMeeting(m);
            setDetailsModalOpen(true);
          }}
          onCancel={(m) => {
            setCancelModalMeeting(m);
            setCancelModalOpen(true);
          }}
        />
      )}

      {/* Pagination */}
      <MyMeetingPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filteredMeetings.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

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
        actionLoading={false}
        onApprove={() => {}}
        onRequestCancel={(m) => {
          setDetailsModalOpen(false);
          setCancelModalMeeting(m);
          setCancelModalOpen(true);
        }}
      />

      {/* Cancel Modal */}
      <MyMeetingCancelModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setCancelModalMeeting(null);
        }}
        meeting={cancelModalMeeting}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
}
