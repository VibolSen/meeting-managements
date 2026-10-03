"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { api, Room, RoomStatus, User } from "@/lib/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";

import {
  RoomHeader,
  RoomStatsCards,
  RoomFilterBar,
  RoomTable,
  RoomCardGrid,
  RoomFormModal,
  RoomDetailsModal,
  RoomImportModal,
  RoomBulkActionsBar,
  RoomSortField,
  RoomStatusFilter,
  RoomCapacityFilter,
  RoomViewMode,
  RoomFormData,
  RoomStats,
} from "@/components/resources/rooms";

import { ResourcePagination } from "@/components/resources/shared/ResourcePagination";

interface RoomManagementViewProps {
  currentUser?: User | null;
}

type SortOrder = "asc" | "desc";

export function RoomManagementView({
  currentUser = null,
}: RoomManagementViewProps = {}) {
  const toast = useToast();
  const { user: authUser } = useAuth();
  const effectiveUser = currentUser || authUser;
  const isAdmin = effectiveUser?.role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Global Confirm Dialog State
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
    confirmText: "Delete",
    onConfirm: () => {},
  });

  // Data states
  const [rooms, setRooms] = useState<Room[]>([]);

  // Search, Filter, Sort & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoomStatusFilter>("ALL");
  const [capacityFilter, setCapacityFilter] = useState<RoomCapacityFilter>("ALL");
  const [sortBy, setSortBy] = useState<RoomSortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [viewMode, setViewMode] = useState<RoomViewMode>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<number>>(new Set());

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<RoomFormData>({
    name: "",
    location: "",
    capacity: 10,
    status: "ACTIVE",
  });
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<Room | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Load Rooms
  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await api.rooms.getAll();
      setRooms(data || []);
    } catch {
      toast.error("Failed to load rooms", "Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Computed Stats
  const stats: RoomStats = useMemo(() => {
    const total = rooms.length;
    const active = rooms.filter((r) => r.status === "ACTIVE").length;
    const maintenance = rooms.filter((r) => r.status === "UNDER_MAINTENANCE").length;
    const inactive = rooms.filter((r) => r.status === "INACTIVE").length;
    const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
    return { total, active, maintenance, inactive, totalCapacity };
  }, [rooms]);

  // Filtered & Sorted Rooms
  const filteredAndSortedRooms = useMemo(() => {
    return rooms
      .filter((r) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = r.name.toLowerCase().includes(q);
          const matchLoc = r.location.toLowerCase().includes(q);
          if (!matchName && !matchLoc) return false;
        }
        if (statusFilter !== "ALL" && r.status !== statusFilter) {
          return false;
        }
        if (capacityFilter === "SMALL" && r.capacity > 10) return false;
        if (capacityFilter === "MEDIUM" && (r.capacity <= 10 || r.capacity > 20)) return false;
        if (capacityFilter === "LARGE" && r.capacity <= 20) return false;
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === "name") cmp = a.name.localeCompare(b.name);
        else if (sortBy === "location") cmp = a.location.localeCompare(b.location);
        else if (sortBy === "capacity") cmp = (a.capacity || 0) - (b.capacity || 0);
        else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
        return sortOrder === "asc" ? cmp : -cmp;
      });
  }, [rooms, searchQuery, statusFilter, capacityFilter, sortBy, sortOrder]);

  // Paginated Rooms
  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedRooms.slice(start, start + pageSize);
  }, [filteredAndSortedRooms, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedRooms.length / pageSize) || 1;

  // CRUD Handlers
  const handleOpenCreate = () => {
    setFormMode("create");
    setFormData({
      name: "",
      location: "",
      capacity: 10,
      status: "ACTIVE",
    });
    setFormModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setFormMode("edit");
    setFormData({
      roomId: room.roomId,
      name: room.name,
      location: room.location,
      capacity: room.capacity,
      status: room.status,
    });
    setFormModalOpen(true);
  };

  const handleView = (room: Room) => {
    setSelectedRoomForDetail(room);
    setDetailModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      toast.warning("Validation Error", "Please provide room name and location.");
      return;
    }

    setActionLoading(true);
    try {
      if (formMode === "edit" && formData.roomId) {
        await api.rooms.update(formData.roomId, {
          name: formData.name,
          location: formData.location,
          capacity: Number(formData.capacity),
          status: formData.status,
        });
        toast.success("Room Updated", `${formData.name} saved successfully.`);
      } else {
        await api.rooms.create({
          name: formData.name,
          location: formData.location,
          capacity: Number(formData.capacity),
          status: formData.status,
        });
        toast.success("Room Created", `${formData.name} added to facilities.`);
      }
      setFormModalOpen(false);
      await loadRooms();
    } catch {
      toast.error("Operation Failed", "Could not save room facility.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (room: Room) => {
    const nextStatus: RoomStatus =
      room.status === "ACTIVE" ? "UNDER_MAINTENANCE" : "ACTIVE";
    setActionLoading(true);
    try {
      await api.rooms.update(room.roomId, { status: nextStatus });
      toast.success(
        "Status Changed",
        `${room.name} is now ${nextStatus === "ACTIVE" ? "Operational" : "Under Maintenance"}.`
      );
      if (selectedRoomForDetail?.roomId === room.roomId) {
        setSelectedRoomForDetail({ ...selectedRoomForDetail, status: nextStatus });
      }
      await loadRooms();
    } catch {
      toast.error("Failed", "Could not update room operational status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (roomId: number) => {
    const target = rooms.find((r) => r.roomId === roomId);
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${target?.name || "Room"}`,
      message: "Are you sure you want to permanently delete this room facility? This cannot be undone.",
      variant: "danger",
      confirmText: "Delete Room",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await api.rooms.delete(roomId);
          toast.success("Room Removed", "Room deleted successfully.");
          selectedRoomIds.delete(roomId);
          setSelectedRoomIds(new Set(selectedRoomIds));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await loadRooms();
        } catch {
          toast.error("Deletion Blocked", "Cannot delete room with active bookings.");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Multi-select & Bulk Actions
  const handleToggleSelectRoom = (roomId: number) => {
    const next = new Set(selectedRoomIds);
    if (next.has(roomId)) next.delete(roomId);
    else next.add(roomId);
    setSelectedRoomIds(next);
  };

  const handleToggleSelectAll = () => {
    const curIds = paginatedRooms.map((r) => r.roomId);
    const isAll = curIds.every((id) => selectedRoomIds.has(id));
    const next = new Set(selectedRoomIds);
    if (isAll) {
      curIds.forEach((id) => next.delete(id));
    } else {
      curIds.forEach((id) => next.add(id));
    }
    setSelectedRoomIds(next);
  };

  const handleBulkSetActive = async () => {
    setActionLoading(true);
    let count = 0;
    for (const id of Array.from(selectedRoomIds)) {
      try {
        await api.rooms.update(id, { status: "ACTIVE" });
        count++;
      } catch {}
    }
    setActionLoading(false);
    toast.success(`Updated ${count} rooms to Active.`);
    setSelectedRoomIds(new Set());
    loadRooms();
  };

  const handleBulkSetMaintenance = async () => {
    setActionLoading(true);
    let count = 0;
    for (const id of Array.from(selectedRoomIds)) {
      try {
        await api.rooms.update(id, { status: "UNDER_MAINTENANCE" });
        count++;
      } catch {}
    }
    setActionLoading(false);
    toast.success(`Marked ${count} rooms Under Maintenance.`);
    setSelectedRoomIds(new Set());
    loadRooms();
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${selectedRoomIds.size} Rooms`,
      message: "Are you sure you want to permanently delete all selected room facilities?",
      variant: "danger",
      confirmText: "Delete Selected",
      onConfirm: async () => {
        setActionLoading(true);
        let count = 0;
        for (const id of Array.from(selectedRoomIds)) {
          try {
            await api.rooms.delete(id);
            count++;
          } catch {}
        }
        setActionLoading(false);
        toast.success(`Deleted ${count} rooms.`);
        setSelectedRoomIds(new Set());
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        loadRooms();
      },
    });
  };

  const handleBulkExport = () => {
    const selected = rooms.filter((r) => selectedRoomIds.has(r.roomId));
    if (selected.length === 0) return;
    const data = selected.map((r) => ({
      "Room ID": r.roomId,
      "Room Name": r.name,
      "Location": r.location,
      "Capacity": r.capacity,
      "Status": r.status,
      "Executive Boardroom": r.capacity >= 20 ? "YES" : "NO",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Selected Rooms");
    XLSX.writeFile(wb, "Selected_Rooms_Export.xlsx");
    toast.success("Excel Exported", `Saved ${data.length} selected rooms.`);
  };

  const handleExportExcel = () => {
    const listToExport = filteredAndSortedRooms;
    if (listToExport.length === 0) {
      toast.warning("Export Warning", "No room facilities to export.");
      return;
    }
    const data = listToExport.map((r) => ({
      "Room ID": r.roomId,
      "Room Name": r.name,
      "Location": r.location,
      "Capacity": r.capacity,
      "Status": r.status,
      "Executive Boardroom": r.capacity >= 20 ? "YES" : "NO",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rooms");
    XLSX.writeFile(wb, "Meeting_Rooms_Export.xlsx");
    toast.success("Excel Exported", `Saved ${data.length} rooms to spreadsheet.`);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <RoomHeader
        isAdmin={isAdmin}
        loading={loading}
        totalRooms={rooms.length}
        onRefresh={loadRooms}
        onAddRoom={handleOpenCreate}
        onImportRooms={() => setImportModalOpen(true)}
        onExportExcel={handleExportExcel}
      />

      <RoomStatsCards stats={stats} />

      {/* Filter Bar and Data Presentation with tight spacing */}
      <div className="space-y-1.5">
        <RoomFilterBar
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
          capacityFilter={capacityFilter}
          onCapacityFilterChange={(c) => {
            setCapacityFilter(c);
            setCurrentPage(1);
          }}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onToggleSortOrder={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={() => {
            setSearchQuery("");
            setStatusFilter("ALL");
            setCapacityFilter("ALL");
            setSortBy("name");
            setSortOrder("asc");
            setCurrentPage(1);
          }}
          isFiltered={searchQuery.trim().length > 0 || statusFilter !== "ALL" || capacityFilter !== "ALL" || sortBy !== "name" || sortOrder !== "asc"}
          totalResults={filteredAndSortedRooms.length}
          onExportExcel={handleExportExcel}
        />

        {viewMode === "table" ? (
          <RoomTable
            rooms={paginatedRooms}
            loading={loading}
            isAdmin={isAdmin}
            actionLoading={actionLoading}
            selectedRoomIds={selectedRoomIds}
            onToggleSelectRoom={handleToggleSelectRoom}
            onToggleSelectAll={handleToggleSelectAll}
            isAllSelected={paginatedRooms.length > 0 && paginatedRooms.every((r) => selectedRoomIds.has(r.roomId))}
            onViewRoom={handleView}
            onEditRoom={handleOpenEdit}
            onToggleRoomStatus={handleToggleStatus}
            onDeleteRoom={handleDelete}
          />
        ) : (
          <RoomCardGrid
            rooms={paginatedRooms}
            loading={loading}
            isAdmin={isAdmin}
            actionLoading={actionLoading}
            selectedRoomIds={selectedRoomIds}
            onToggleSelectRoom={handleToggleSelectRoom}
            onViewRoom={handleView}
            onEditRoom={handleOpenEdit}
            onToggleRoomStatus={handleToggleStatus}
            onDeleteRoom={handleDelete}
          />
        )}

        <ResourcePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredAndSortedRooms.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="rooms"
        />
      </div>

      {/* Floating Bulk Actions Bar */}
      {isAdmin && (
        <RoomBulkActionsBar
          selectedCount={selectedRoomIds.size}
          onClearSelection={() => setSelectedRoomIds(new Set())}
          onBulkSetActive={handleBulkSetActive}
          onBulkSetMaintenance={handleBulkSetMaintenance}
          onBulkExport={handleBulkExport}
          onBulkDelete={handleBulkDelete}
          actionLoading={actionLoading}
        />
      )}

      {/* Modals */}
      <RoomFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        formMode={formMode}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSave}
        loading={actionLoading}
      />
      <RoomDetailsModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        room={selectedRoomForDetail}
        isAdmin={isAdmin}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
        actionLoading={actionLoading}
      />
      <RoomImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={loadRooms}
      />

      {/* Global Confirmation Dialog */}
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
    </div>
  );
}
