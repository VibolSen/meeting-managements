"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { api, Staff, StaffRole, StaffAvailability, User } from "@/lib/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";

import {
  StaffHeader,
  StaffStatsCards,
  StaffFilterBar,
  StaffTable,
  StaffCardGrid,
  StaffFormModal,
  StaffDetailsModal,
  StaffImportModal,
  StaffBulkActionsBar,
  StaffSortField,
  StaffRoleFilter,
  StaffAvailabilityFilter,
  StaffViewMode,
  StaffFormData,
  StaffStats,
} from "@/components/resources/staff";

import { ResourcePagination } from "@/components/resources/shared/ResourcePagination";

interface StaffRosterViewProps {
  currentUser?: User | null;
}

type SortOrder = "asc" | "desc";

export function StaffRosterView({
  currentUser = null,
}: StaffRosterViewProps = {}) {
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
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // Search, Filter, Sort & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<StaffRoleFilter>("ALL");
  const [availFilter, setAvailFilter] = useState<StaffAvailabilityFilter>("ALL");
  const [sortBy, setSortBy] = useState<StaffSortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [viewMode, setViewMode] = useState<StaffViewMode>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<number>>(new Set());

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<StaffFormData>({
    name: "",
    role: "TECHNICIAN",
    skill: "",
    availabilityStatus: "AVAILABLE",
  });
  const [selectedStaffForDetail, setSelectedStaffForDetail] = useState<Staff | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Load Staff
  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await api.staff.getAll();
      setStaffList(data || []);
    } catch {
      toast.error("Failed to load staff roster", "Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  // Computed Stats
  const stats: StaffStats = useMemo(() => {
    const total = staffList.length;
    const available = staffList.filter((s) => s.availabilityStatus === "AVAILABLE").length;
    const assigned = staffList.filter((s) => s.availabilityStatus === "ASSIGNED").length;
    const offDuty = staffList.filter((s) => s.availabilityStatus === "OFF_DUTY").length;
    return { total, available, assigned, offDuty };
  }, [staffList]);

  // Filtered & Sorted Staff
  const filteredAndSortedStaff = useMemo(() => {
    return staffList
      .filter((s) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = s.name.toLowerCase().includes(q);
          const matchRole = s.role.toLowerCase().includes(q);
          const matchSkill = s.skill?.toLowerCase().includes(q);
          if (!matchName && !matchRole && !matchSkill) return false;
        }
        if (roleFilter !== "ALL" && s.role !== roleFilter) {
          return false;
        }
        if (availFilter !== "ALL" && s.availabilityStatus !== availFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === "name") cmp = a.name.localeCompare(b.name);
        else if (sortBy === "role") cmp = a.role.localeCompare(b.role);
        else if (sortBy === "availabilityStatus") cmp = a.availabilityStatus.localeCompare(b.availabilityStatus);
        return sortOrder === "asc" ? cmp : -cmp;
      });
  }, [staffList, searchQuery, roleFilter, availFilter, sortBy, sortOrder]);

  // Paginated Staff
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedStaff.slice(start, start + pageSize);
  }, [filteredAndSortedStaff, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedStaff.length / pageSize) || 1;

  // CRUD Handlers
  const handleOpenCreate = () => {
    setFormMode("create");
    setFormData({
      name: "",
      role: "TECHNICIAN",
      skill: "",
      availabilityStatus: "AVAILABLE",
    });
    setFormModalOpen(true);
  };

  const handleOpenEdit = (staff: Staff) => {
    setFormMode("edit");
    setFormData({
      staffId: staff.staffId,
      name: staff.name,
      role: staff.role,
      skill: staff.skill || "",
      availabilityStatus: staff.availabilityStatus,
    });
    setFormModalOpen(true);
  };

  const handleView = (staff: Staff) => {
    setSelectedStaffForDetail(staff);
    setDetailModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning("Validation Error", "Please provide staff member name.");
      return;
    }

    setActionLoading(true);
    try {
      if (formMode === "edit" && formData.staffId) {
        await api.staff.update(formData.staffId, {
          name: formData.name,
          role: formData.role,
          skill: formData.skill,
          availabilityStatus: formData.availabilityStatus,
        });
        toast.success("Profile Updated", `${formData.name} saved.`);
      } else {
        await api.staff.create({
          name: formData.name,
          role: formData.role,
          skill: formData.skill,
          availabilityStatus: formData.availabilityStatus,
        });
        toast.success("Staff Enrolled", `${formData.name} added to roster.`);
      }
      setFormModalOpen(false);
      await loadStaff();
    } catch {
      toast.error("Operation Failed", "Could not save staff member.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (staff: Staff) => {
    const nextStatus: StaffAvailability =
      staff.availabilityStatus === "AVAILABLE" ? "OFF_DUTY" : "AVAILABLE";
    setActionLoading(true);
    try {
      await api.staff.update(staff.staffId, { availabilityStatus: nextStatus });
      toast.success(
        "Roster Updated",
        `${staff.name} is now ${nextStatus === "AVAILABLE" ? "Available" : "Off Duty"}.`
      );
      if (selectedStaffForDetail?.staffId === staff.staffId) {
        setSelectedStaffForDetail({ ...selectedStaffForDetail, availabilityStatus: nextStatus });
      }
      await loadStaff();
    } catch {
      toast.error("Failed", "Could not change staff availability.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (staffId: number) => {
    const target = staffList.find((s) => s.staffId === staffId);
    setConfirmDialog({
      isOpen: true,
      title: `Remove ${target?.name || "Staff Member"}`,
      message: "Are you sure you want to remove this staff member from the roster? This cannot be undone.",
      variant: "danger",
      confirmText: "Remove Staff",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await api.staff.delete(staffId);
          toast.success("Staff Removed", "Removed from staff roster.");
          selectedStaffIds.delete(staffId);
          setSelectedStaffIds(new Set(selectedStaffIds));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await loadStaff();
        } catch {
          toast.error("Failed", "Cannot delete staff currently assigned to meetings.");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Multi-select & Bulk Actions
  const handleToggleSelectStaff = (staffId: number) => {
    const next = new Set(selectedStaffIds);
    if (next.has(staffId)) next.delete(staffId);
    else next.add(staffId);
    setSelectedStaffIds(next);
  };

  const handleToggleSelectAll = () => {
    const curIds = paginatedStaff.map((s) => s.staffId);
    const isAll = curIds.every((id) => selectedStaffIds.has(id));
    const next = new Set(selectedStaffIds);
    if (isAll) {
      curIds.forEach((id) => next.delete(id));
    } else {
      curIds.forEach((id) => next.add(id));
    }
    setSelectedStaffIds(next);
  };

  const handleBulkSetAvailable = async () => {
    setActionLoading(true);
    let count = 0;
    for (const id of Array.from(selectedStaffIds)) {
      try {
        await api.staff.update(id, { availabilityStatus: "AVAILABLE" });
        count++;
      } catch {}
    }
    setActionLoading(false);
    toast.success(`Marked ${count} staff Available.`);
    setSelectedStaffIds(new Set());
    loadStaff();
  };

  const handleBulkSetOffDuty = async () => {
    setActionLoading(true);
    let count = 0;
    for (const id of Array.from(selectedStaffIds)) {
      try {
        await api.staff.update(id, { availabilityStatus: "OFF_DUTY" });
        count++;
      } catch {}
    }
    setActionLoading(false);
    toast.success(`Marked ${count} staff Off Duty.`);
    setSelectedStaffIds(new Set());
    loadStaff();
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: `Remove ${selectedStaffIds.size} Staff Members`,
      message: "Are you sure you want to remove all selected staff members from the roster?",
      variant: "danger",
      confirmText: "Remove Selected",
      onConfirm: async () => {
        setActionLoading(true);
        let count = 0;
        for (const id of Array.from(selectedStaffIds)) {
          try {
            await api.staff.delete(id);
            count++;
          } catch {}
        }
        setActionLoading(false);
        toast.success(`Removed ${count} staff members.`);
        setSelectedStaffIds(new Set());
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        loadStaff();
      },
    });
  };

  const handleBulkExport = () => {
    const selected = staffList.filter((s) => selectedStaffIds.has(s.staffId));
    if (selected.length === 0) return;
    const data = selected.map((s) => ({
      "Staff ID": s.staffId,
      "Full Name": s.name,
      "Role": s.role,
      "Specialization": s.skill || "Standard operations",
      "Availability": s.availabilityStatus,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Selected Staff");
    XLSX.writeFile(wb, "Selected_Staff_Export.xlsx");
    toast.success("Excel Exported", `Saved ${data.length} selected staff.`);
  };

  const handleExportExcel = () => {
    const listToExport = filteredAndSortedStaff;
    if (listToExport.length === 0) {
      toast.warning("Export Warning", "No staff members to export.");
      return;
    }
    const data = listToExport.map((s) => ({
      "Staff ID": s.staffId,
      "Full Name": s.name,
      "Role": s.role,
      "Specialization": s.skill || "Standard operations",
      "Availability": s.availabilityStatus,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff");
    XLSX.writeFile(wb, "Staff_Roster_Export.xlsx");
    toast.success("Excel Exported", `Saved ${data.length} staff to spreadsheet.`);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <StaffHeader
        isAdmin={isAdmin}
        loading={loading}
        totalStaff={staffList.length}
        onRefresh={loadStaff}
        onAddStaff={handleOpenCreate}
        onImportStaff={() => setImportModalOpen(true)}
        onExportExcel={handleExportExcel}
      />

      <StaffStatsCards stats={stats} />

      {/* Filter Bar and Data Presentation with tight spacing */}
      <div className="space-y-1.5">
        <StaffFilterBar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          roleFilter={roleFilter}
          onRoleFilterChange={(r) => {
            setRoleFilter(r);
            setCurrentPage(1);
          }}
          availabilityFilter={availFilter}
          onAvailabilityFilterChange={(a) => {
            setAvailFilter(a);
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
            setRoleFilter("ALL");
            setAvailFilter("ALL");
            setSortBy("name");
            setSortOrder("asc");
            setCurrentPage(1);
          }}
          isFiltered={searchQuery.trim().length > 0 || roleFilter !== "ALL" || availFilter !== "ALL" || sortBy !== "name" || sortOrder !== "asc"}
          totalResults={filteredAndSortedStaff.length}
          onExportExcel={handleExportExcel}
        />

        {viewMode === "table" ? (
          <StaffTable
            staffList={paginatedStaff}
            loading={loading}
            isAdmin={isAdmin}
            actionLoading={actionLoading}
            selectedStaffIds={selectedStaffIds}
            onToggleSelectStaff={handleToggleSelectStaff}
            onToggleSelectAll={handleToggleSelectAll}
            isAllSelected={paginatedStaff.length > 0 && paginatedStaff.every((s) => selectedStaffIds.has(s.staffId))}
            onViewStaff={handleView}
            onEditStaff={handleOpenEdit}
            onToggleStaffStatus={handleToggleStatus}
            onDeleteStaff={handleDelete}
          />
        ) : (
          <StaffCardGrid
            staffList={paginatedStaff}
            loading={loading}
            isAdmin={isAdmin}
            actionLoading={actionLoading}
            selectedStaffIds={selectedStaffIds}
            onToggleSelectStaff={handleToggleSelectStaff}
            onViewStaff={handleView}
            onEditStaff={handleOpenEdit}
            onToggleStaffStatus={handleToggleStatus}
            onDeleteStaff={handleDelete}
          />
        )}

        <ResourcePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredAndSortedStaff.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="staff"
        />
      </div>

      {/* Floating Bulk Actions Bar */}
      {isAdmin && (
        <StaffBulkActionsBar
          selectedCount={selectedStaffIds.size}
          onClearSelection={() => setSelectedStaffIds(new Set())}
          onBulkSetAvailable={handleBulkSetAvailable}
          onBulkSetOffDuty={handleBulkSetOffDuty}
          onBulkExport={handleBulkExport}
          onBulkDelete={handleBulkDelete}
          actionLoading={actionLoading}
        />
      )}

      {/* Modals */}
      <StaffFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        formMode={formMode}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSave}
        loading={actionLoading}
      />
      <StaffDetailsModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        staff={selectedStaffForDetail}
        isAdmin={isAdmin}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
        actionLoading={actionLoading}
      />
      <StaffImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={loadStaff}
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
