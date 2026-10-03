"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import {
  api,
  Meeting,
  Room,
  User,
  AttendeeResponseStatus,
} from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ResourcePagination } from "@/components/resources/shared/ResourcePagination";

import {
  MeetingHeader,
  MeetingStatsCards,
  MeetingFilterBar,
  MeetingTable,
  MeetingCardGrid,
  MeetingDetailsModal,
  MeetingCancelModal,
  MeetingBulkActionsBar,
  MeetingSortField,
  SortOrder,
  MeetingStatusFilter,
  MeetingViewMode,
  MeetingStats,
} from "@/components/meetings";
import { BookingModal } from "@/components/BookingModal";

interface MeetingsListViewProps {
  currentUser?: User | null;
  onNavigateToBooking?: () => void;
}

export function MeetingsListView({
  currentUser = null,
  onNavigateToBooking,
}: MeetingsListViewProps = {}) {
  const toast = useToast();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const effectiveUser = currentUser || authUser;
  const isAdmin = effectiveUser?.role === "ADMIN";

  // Data states
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MeetingStatusFilter>("ALL");
  const [roomIdFilter, setRoomIdFilter] = useState<number | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<MeetingSortField>("startTime");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [viewMode, setViewMode] = useState<MeetingViewMode>("table");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Multi-select state for bulk actions
  const [selectedMeetingIds, setSelectedMeetingIds] = useState<Set<number>>(new Set());

  // Modal states
  const [selectedMeetingForDetail, setSelectedMeetingForDetail] = useState<Meeting | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [meetingToCancel, setMeetingToCancel] = useState<Meeting | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Global Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: "danger" | "warning" | "primary";
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "danger",
    confirmText: "Confirm",
    onConfirm: () => {},
  });

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [meetingsData, roomsData] = await Promise.all([
        api.meetings.getAll().catch(() => []),
        api.rooms.getAll().catch(() => []),
      ]);
      setMeetings(meetingsData || []);
      setRooms(roomsData || []);
    } catch {
      toast.error("Failed to load meetings", "Check backend server status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Stats
  const stats: MeetingStats = useMemo(() => {
    const total = meetings.length;
    const pending = meetings.filter((m) => m.status === "PENDING").length;
    const confirmed = meetings.filter((m) => m.status === "CONFIRMED").length;
    const completed = meetings.filter((m) => m.status === "COMPLETED").length;
    const cancelled = meetings.filter((m) => m.status === "CANCELLED").length;
    const myMeetings = effectiveUser
      ? meetings.filter(
          (m) =>
            m.organizer?.userId === effectiveUser.userId ||
            m.attendees?.some((a) => a.userId === effectiveUser.userId)
        ).length
      : 0;

    return { total, pending, confirmed, completed, cancelled, myMeetings };
  }, [meetings, effectiveUser]);

  // Filter & Sort
  const filteredAndSortedMeetings = useMemo(() => {
    return meetings
      .filter((m) => {
        // Status tab/filter
        if (statusFilter === "PENDING" && m.status !== "PENDING") return false;
        if (statusFilter === "CONFIRMED" && m.status !== "CONFIRMED") return false;
        if (statusFilter === "COMPLETED" && m.status !== "COMPLETED") return false;
        if (statusFilter === "CANCELLED" && m.status !== "CANCELLED") return false;
        if (statusFilter === "MINE") {
          const isOrganizer = m.organizer?.userId === effectiveUser?.userId;
          const isAttendee = m.attendees?.some((a) => a.userId === effectiveUser?.userId);
          if (!isOrganizer && !isAttendee) return false;
        }

        // Room filter
        if (roomIdFilter !== "ALL" && m.room?.roomId !== roomIdFilter) {
          return false;
        }

        // Text query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = m.title?.toLowerCase().includes(q);
          const matchPurpose = m.purpose?.toLowerCase().includes(q);
          const matchRoom = m.room?.name?.toLowerCase().includes(q);
          const matchLocation = m.room?.location?.toLowerCase().includes(q);
          const matchOrganizer = m.organizer?.name?.toLowerCase().includes(q);
          if (!matchTitle && !matchPurpose && !matchRoom && !matchLocation && !matchOrganizer) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === "startTime") {
          cmp = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        } else if (sortBy === "title") {
          cmp = (a.title || "").localeCompare(b.title || "");
        } else if (sortBy === "room") {
          cmp = (a.room?.name || "").localeCompare(b.room?.name || "");
        } else if (sortBy === "status") {
          cmp = (a.status || "").localeCompare(b.status || "");
        }
        return sortOrder === "asc" ? cmp : -cmp;
      });
  }, [meetings, statusFilter, roomIdFilter, searchQuery, sortBy, sortOrder, effectiveUser]);

  // Paginated Meetings
  const paginatedMeetings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedMeetings.slice(start, start + pageSize);
  }, [filteredAndSortedMeetings, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedMeetings.length / pageSize) || 1;

  // New Booking Pop-up Modal
  const handleBooking = () => {
    if (onNavigateToBooking) {
      onNavigateToBooking();
    } else {
      setBookingModalOpen(true);
    }
  };

  // Single Actions
  const handleView = (meeting: Meeting) => {
    setSelectedMeetingForDetail(meeting);
    setDetailModalOpen(true);
  };

  const handleApprove = async (meetingId: number) => {
    setActionLoading(true);
    try {
      await api.meetings.approve(meetingId);
      toast.success("Meeting Approved", "Boardroom reservation is confirmed.");
      if (selectedMeetingForDetail?.meetingId === meetingId) {
        setSelectedMeetingForDetail({ ...selectedMeetingForDetail, status: "CONFIRMED" });
      }
      await loadData();
    } catch {
      toast.error("Approval Failed", "Could not approve the meeting reservation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCancelModal = (meeting: Meeting) => {
    setMeetingToCancel(meeting);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!meetingToCancel) return;
    setActionLoading(true);
    try {
      await api.meetings.cancel(meetingToCancel.meetingId, cancelReason);
      toast.success("Meeting Cancelled", "Equipment inventory stock has been restored.");
      setCancelModalOpen(false);
      setCancelReason("");
      setMeetingToCancel(null);
      if (selectedMeetingForDetail?.meetingId === meetingToCancel.meetingId) {
        setDetailModalOpen(false);
      }
      await loadData();
    } catch {
      toast.error("Cancellation Failed", "Could not cancel meeting.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRSVP = async (meetingId: number, status: AttendeeResponseStatus) => {
    if (!effectiveUser) return;
    setActionLoading(true);
    try {
      await api.meetings.updateRSVP(meetingId, effectiveUser.userId, status);
      toast.success(
        status === "ACCEPTED" ? "RSVP Accepted" : "RSVP Declined",
        "Your attendance response was recorded."
      );
      if (selectedMeetingForDetail && selectedMeetingForDetail.meetingId === meetingId) {
        const updated = await api.meetings.getById(meetingId);
        setSelectedMeetingForDetail(updated);
      }
      await loadData();
    } catch {
      toast.error("RSVP Failed", "Could not update attendance status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Multi-select & Bulk Actions
  const handleToggleSelectMeeting = (meetingId: number) => {
    const next = new Set(selectedMeetingIds);
    if (next.has(meetingId)) next.delete(meetingId);
    else next.add(meetingId);
    setSelectedMeetingIds(next);
  };

  const handleToggleSelectAll = () => {
    const curIds = paginatedMeetings.map((m) => m.meetingId);
    const isAll = curIds.every((id) => selectedMeetingIds.has(id));
    const next = new Set(selectedMeetingIds);
    if (isAll) {
      curIds.forEach((id) => next.delete(id));
    } else {
      curIds.forEach((id) => next.add(id));
    }
    setSelectedMeetingIds(next);
  };

  const handleBulkApprove = async () => {
    const eligible = meetings.filter(
      (m) => selectedMeetingIds.has(m.meetingId) && m.status === "PENDING"
    );
    if (eligible.length === 0) {
      toast.warning("No Pending Meetings", "None of the selected meetings are awaiting approval.");
      return;
    }

    setActionLoading(true);
    let count = 0;
    for (const m of eligible) {
      try {
        await api.meetings.approve(m.meetingId);
        count++;
      } catch {}
    }
    setActionLoading(false);
    toast.success(`Approved ${count} meetings successfully.`);
    setSelectedMeetingIds(new Set());
    await loadData();
  };

  const handleBulkCancel = () => {
    const eligible = meetings.filter(
      (m) => selectedMeetingIds.has(m.meetingId) && (m.status === "PENDING" || m.status === "CONFIRMED")
    );
    if (eligible.length === 0) {
      toast.warning("No Active Meetings", "None of the selected meetings can be cancelled.");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: `Cancel ${eligible.length} Selected Meetings`,
      message: `Are you sure you want to cancel ${eligible.length} meetings? This will release reserved rooms and restore equipment back into inventory.`,
      variant: "danger",
      confirmText: `Cancel ${eligible.length} Meetings`,
      onConfirm: async () => {
        setActionLoading(true);
        let count = 0;
        for (const m of eligible) {
          try {
            await api.meetings.cancel(m.meetingId, "Bulk administrative cancellation");
            count++;
          } catch {}
        }
        setActionLoading(false);
        toast.success(`Cancelled ${count} meetings.`);
        setSelectedMeetingIds(new Set());
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        await loadData();
      },
    });
  };

  const handleBulkExport = () => {
    const selected = meetings.filter((m) => selectedMeetingIds.has(m.meetingId));
    if (selected.length === 0) return;
    exportMeetingsToExcel(selected, "Selected_Meetings_Schedule.xlsx");
    toast.success("Excel Exported", `Saved ${selected.length} meetings to spreadsheet.`);
  };

  const handleExportFilteredExcel = () => {
    if (filteredAndSortedMeetings.length === 0) {
      toast.warning("Export Warning", "No meetings to export.");
      return;
    }
    exportMeetingsToExcel(filteredAndSortedMeetings, "Meetings_Schedule_Export.xlsx");
    toast.success("Excel Exported", `Saved ${filteredAndSortedMeetings.length} meetings to spreadsheet.`);
  };

  const exportMeetingsToExcel = (list: Meeting[], filename: string) => {
    const data = list.map((m) => ({
      "Meeting ID": m.meetingId,
      "Title": m.title,
      "Purpose": m.purpose || "",
      "Status": m.status,
      "Start Date & Time": m.startTime.replace("T", " "),
      "End Date & Time": m.endTime.replace("T", " "),
      "Room": m.room?.name || "Unassigned",
      "Room Location": m.room?.location || "",
      "Organizer": m.organizer?.name || "Unknown",
      "Organizer Email": m.organizer?.email || "",
      "Total Attendees": m.attendees?.length || 0,
      "Total Equipment": m.materials?.length || 0,
      "Total Staff Assigned": m.staffAssignments?.length || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Meetings");
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <MeetingHeader
        loading={loading}
        totalMeetings={meetings.length}
        pendingCount={stats.pending}
        onRefresh={loadData}
        onNewBooking={handleBooking}
        onExportExcel={handleExportFilteredExcel}
      />

      {/* KPI Stats Cards */}
      <MeetingStatsCards
        stats={stats}
        currentStatusFilter={statusFilter}
        onFilterChange={(f) => {
          setStatusFilter(f);
          setCurrentPage(1);
        }}
      />

      {/* Filter Bar and Data Presentation with tight spacing */}
      <div className="space-y-1.5">
        <MeetingFilterBar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(s) => {
            setStatusFilter(s);
            setCurrentPage(1);
          }}
          roomIdFilter={roomIdFilter}
          onRoomIdFilterChange={(r) => {
            setRoomIdFilter(r);
            setCurrentPage(1);
          }}
          rooms={rooms}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onToggleSortOrder={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={() => {
            setSearchQuery("");
            setStatusFilter("ALL");
            setRoomIdFilter("ALL");
            setSortBy("startTime");
            setSortOrder("desc");
            setCurrentPage(1);
          }}
          isFiltered={
            searchQuery.trim().length > 0 ||
            statusFilter !== "ALL" ||
            roomIdFilter !== "ALL" ||
            sortBy !== "startTime" ||
            sortOrder !== "desc"
          }
          totalResults={filteredAndSortedMeetings.length}
          onExportExcel={handleExportFilteredExcel}
        />

        {viewMode === "table" ? (
          <MeetingTable
            meetings={paginatedMeetings}
            loading={loading}
            isAdmin={isAdmin}
            currentUser={effectiveUser}
            actionLoading={actionLoading}
            selectedMeetingIds={selectedMeetingIds}
            onToggleSelectMeeting={handleToggleSelectMeeting}
            onToggleSelectAll={handleToggleSelectAll}
            isAllSelected={
              paginatedMeetings.length > 0 &&
              paginatedMeetings.every((m) => selectedMeetingIds.has(m.meetingId))
            }
            onViewMeeting={handleView}
            onApproveMeeting={handleApprove}
            onRequestCancelMeeting={handleOpenCancelModal}
            onRSVP={handleRSVP}
          />
        ) : (
          <MeetingCardGrid
            meetings={paginatedMeetings}
            loading={loading}
            isAdmin={isAdmin}
            currentUser={effectiveUser}
            actionLoading={actionLoading}
            selectedMeetingIds={selectedMeetingIds}
            onToggleSelectMeeting={handleToggleSelectMeeting}
            onViewMeeting={handleView}
            onApproveMeeting={handleApprove}
            onRequestCancelMeeting={handleOpenCancelModal}
            onRSVP={handleRSVP}
          />
        )}

        <ResourcePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredAndSortedMeetings.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="meetings"
        />
      </div>

      {/* Floating Bulk Actions Bar (Admin only) */}
      {isAdmin && (
        <MeetingBulkActionsBar
          selectedCount={selectedMeetingIds.size}
          onClearSelection={() => setSelectedMeetingIds(new Set())}
          onBulkApprove={handleBulkApprove}
          onBulkCancel={handleBulkCancel}
          onBulkExport={handleBulkExport}
          actionLoading={actionLoading}
        />
      )}

      {/* Meeting Details Modal */}
      <MeetingDetailsModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        meeting={selectedMeetingForDetail}
        isAdmin={isAdmin}
        currentUser={effectiveUser}
        actionLoading={actionLoading}
        onApprove={handleApprove}
        onRequestCancel={handleOpenCancelModal}
        onRSVP={handleRSVP}
      />

      {/* Meeting Cancel Reason Modal */}
      <MeetingCancelModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        meeting={meetingToCancel}
        cancelReason={cancelReason}
        onReasonChange={setCancelReason}
        onConfirm={handleConfirmCancel}
        loading={actionLoading}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => !actionLoading && setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        isLoading={actionLoading}
      />

      {/* Pop-up Schedule Meeting Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        currentUser={effectiveUser}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}
