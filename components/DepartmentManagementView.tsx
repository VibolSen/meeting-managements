"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { api, User, Department } from "@/lib/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";
import {
  DepartmentHeader,
  DepartmentStatsCards,
  DepartmentFilterBar,
  DepartmentTable,
  DepartmentCardGrid,
  DepartmentPagination,
  DepartmentFormModal,
  DepartmentDetailsModal,
  DepartmentImportModal,
  DepartmentBulkActionsBar,
  DepartmentSortField,
  SortOrder,
  DepartmentViewMode,
  DepartmentFormData,
} from "@/components/departments";

interface DepartmentManagementViewProps {
  currentUser?: User | null;
}

export function DepartmentManagementView({
  currentUser = null,
}: DepartmentManagementViewProps = {}) {
  const toast = useToast();
  const { user: authUser } = useAuth();
  const effectiveUser = currentUser || authUser;
  const isAdmin = effectiveUser?.role === "ADMIN";

  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<DepartmentSortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // View Mode & Pagination states
  const [viewMode, setViewMode] = useState<DepartmentViewMode>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Multi-Selection State for Bulk Actions
  const [selectedDeptIds, setSelectedDeptIds] = useState<Set<number>>(new Set());

  // Data states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Modal and action states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingDeptId, setEditingDeptId] = useState<number | null>(null);

  const [selectedDeptForDetail, setSelectedDeptForDetail] = useState<Department | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [importModalOpen, setImportModalOpen] = useState(false);
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

  // Department form state
  const [deptForm, setDeptForm] = useState<DepartmentFormData>({
    name: "",
    description: "",
  });

  // Load Data from Backend
  const loadData = async () => {
    setLoading(true);
    try {
      const [deptsData, usersData] = await Promise.all([
        api.departments.getAll().catch(() => []),
        api.users.getAll().catch(() => []),
      ]);
      setDepartments(deptsData || []);
      setUsers(usersData || []);
    } catch {
      toast.error("Failed to load departments from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, sortOrder]);

  // Filtered and Sorted Departments
  const filteredAndSortedDepartments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const result = departments.filter((d) => {
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q));

      return matchesSearch;
    });

    result.sort((a, b) => {
      let comp = 0;
      if (sortBy === "name") {
        comp = a.name.localeCompare(b.name);
      } else if (sortBy === "members") {
        const countA = users.filter((u) => u.departmentId === a.departmentId).length;
        const countB = users.filter((u) => u.departmentId === b.departmentId).length;
        comp = countA - countB;
      } else if (sortBy === "id") {
        comp = a.departmentId - b.departmentId;
      }

      return sortOrder === "asc" ? comp : -comp;
    });

    return result;
  }, [departments, users, searchQuery, sortBy, sortOrder]);

  // Paginated Slices
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedDepartments.length / pageSize));
  const paginatedDepartments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedDepartments.slice(start, start + pageSize);
  }, [filteredAndSortedDepartments, currentPage, pageSize]);

  // Department Metrics for Stat Cards
  const stats = useMemo(() => {
    const totalDepts = departments.length;
    const assignedMembers = users.filter((u) => u.departmentId).length;
    const unassignedMembers = users.filter((u) => !u.departmentId).length;

    let largestDeptName = "None";
    let largestDeptCount = 0;

    departments.forEach((d) => {
      const count = users.filter((u) => u.departmentId === d.departmentId).length;
      if (count > largestDeptCount) {
        largestDeptCount = count;
        largestDeptName = d.name;
      }
    });

    return {
      totalDepts,
      assignedMembers,
      unassignedMembers,
      largestDeptName: largestDeptCount > 0 ? largestDeptName : "None",
      largestDeptCount,
    };
  }, [departments, users]);

  // Reset all filters & sorting
  const handleResetFilters = () => {
    setSearchQuery("");
    setSortBy("name");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const isFiltered = searchQuery !== "" || sortBy !== "name" || sortOrder !== "asc";

  // Selection Logic for Checkboxes
  const handleToggleSelectDept = (deptId: number) => {
    setSelectedDeptIds((prev) => {
      const next = new Set(prev);
      if (next.has(deptId)) {
        next.delete(deptId);
      } else {
        next.add(deptId);
      }
      return next;
    });
  };

  const isAllCurrentPageSelected = useMemo(() => {
    if (paginatedDepartments.length === 0) return false;
    return paginatedDepartments.every((d) => selectedDeptIds.has(d.departmentId));
  }, [paginatedDepartments, selectedDeptIds]);

  const handleToggleSelectAll = () => {
    setSelectedDeptIds((prev) => {
      const next = new Set(prev);
      if (isAllCurrentPageSelected) {
        paginatedDepartments.forEach((d) => next.delete(d.departmentId));
      } else {
        paginatedDepartments.forEach((d) => next.add(d.departmentId));
      }
      return next;
    });
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (filteredAndSortedDepartments.length === 0) {
      toast.error("No departments to export matching current search criteria.");
      return;
    }

    try {
      const data = filteredAndSortedDepartments.map((d) => {
        const count = users.filter((u) => u.departmentId === d.departmentId).length;
        return {
          "Department ID": d.departmentId,
          "Department Name": d.name,
          "Description": d.description || "N/A",
          "Assigned Members Count": count,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Departments");
      XLSX.writeFile(
        workbook,
        `departments_directory_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      toast.success(
        `Exported ${filteredAndSortedDepartments.length} department records to Excel (.xlsx).`
      );
    } catch {
      toast.error("Failed to export Excel file.");
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormMode("create");
    setEditingDeptId(null);
    setDeptForm({
      name: "",
      description: "",
    });
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (dept: Department) => {
    setFormMode("edit");
    setEditingDeptId(dept.departmentId);
    setDeptForm({
      name: dept.name,
      description: dept.description || "",
    });
    setFormModalOpen(true);
  };

  // Open View Details Modal
  const handleViewDepartment = (dept: Department) => {
    setSelectedDeptForDetail(dept);
    setDetailModalOpen(true);
  };

  // Handle Form Submit (Create or Update)
  const handleSubmitDeptForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name.trim()) {
      toast.error("Department name is required.");
      return;
    }

    setActionLoading(true);
    try {
      if (formMode === "create") {
        await api.departments.create({
          name: deptForm.name.trim(),
          description: deptForm.description?.trim() || undefined,
        });
        toast.success(`Department "${deptForm.name.trim()}" created successfully.`);
      } else if (formMode === "edit" && editingDeptId) {
        await api.departments.update(editingDeptId, {
          name: deptForm.name.trim(),
          description: deptForm.description?.trim() || undefined,
        });
        toast.success(`Department "${deptForm.name.trim()}" updated successfully.`);
      }

      setFormModalOpen(false);
      setDeptForm({ name: "", description: "" });
      loadData();
    } catch (err: any) {
      toast.error(
        err?.message ||
          `Failed to ${formMode === "create" ? "create" : "update"} department.`
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Single Department
  const handleDeleteDepartment = (id: number, name: string) => {
    const assignedCount = users.filter((u) => u.departmentId === id).length;

    setConfirmDialog({
      isOpen: true,
      title: "Delete Department",
      message: `Are you sure you want to permanently delete department "${name}"? ${
        assignedCount > 0
          ? `${assignedCount} assigned team members will be safely unassigned.`
          : "This action cannot be undone."
      }`,
      variant: "danger",
      confirmText: "Delete Department",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await api.departments.delete(id);
          toast.success(`Department "${name}" deleted.`);
          setSelectedDeptIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          loadData();
        } catch (err: any) {
          toast.error(err?.message || "Failed to delete department.");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Bulk Action: Batch Delete Departments
  const handleBatchDelete = () => {
    const toDeleteIds = Array.from(selectedDeptIds);
    if (toDeleteIds.length === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: `Delete ${toDeleteIds.length} Departments`,
      message: `Are you sure you want to permanently delete these ${toDeleteIds.length} selected departments? Any assigned members will be safely unassigned.`,
      variant: "danger",
      confirmText: "Delete Selected",
      onConfirm: async () => {
        setActionLoading(true);
        let success = 0;
        for (const id of toDeleteIds) {
          try {
            await api.departments.delete(id);
            success++;
          } catch {}
        }
        setActionLoading(false);
        toast.success(`Deleted ${success} departments.`);
        setSelectedDeptIds(new Set());
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        loadData();
      },
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Banner with Refresh, Import, and Add Department */}
      <DepartmentHeader
        isAdmin={isAdmin}
        loading={loading}
        onRefresh={loadData}
        onAddDepartment={handleOpenCreateModal}
        onImportDepartments={() => setImportModalOpen(true)}
      />

      {/* Metrics Bar */}
      <DepartmentStatsCards stats={stats} />

      {/* Filter and Search Bar with 2-Row layout and Table/Grid Views */}
      <div className="space-y-1.5">
        <DepartmentFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onToggleSortOrder={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          onResetFilters={handleResetFilters}
          isFiltered={isFiltered}
          totalResults={filteredAndSortedDepartments.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onExportExcel={handleExportExcel}
        />

        {/* Main Departments View: Table or Card Grid */}
        {viewMode === "table" ? (
          <DepartmentTable
            departments={paginatedDepartments}
            users={users}
            loading={loading}
            isAdmin={isAdmin}
            actionLoading={actionLoading}
            selectedDeptIds={selectedDeptIds}
            onToggleSelectDept={handleToggleSelectDept}
            onToggleSelectAll={handleToggleSelectAll}
            isAllSelected={isAllCurrentPageSelected}
            onViewDepartment={handleViewDepartment}
            onEditDepartment={handleOpenEditModal}
            onDeleteDepartment={handleDeleteDepartment}
          />
        ) : (
          <DepartmentCardGrid
            departments={paginatedDepartments}
            users={users}
            loading={loading}
            isAdmin={isAdmin}
            actionLoading={actionLoading}
            selectedDeptIds={selectedDeptIds}
            onToggleSelectDept={handleToggleSelectDept}
            onViewDepartment={handleViewDepartment}
            onEditDepartment={handleOpenEditModal}
            onDeleteDepartment={handleDeleteDepartment}
          />
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && filteredAndSortedDepartments.length > 0 && (
        <DepartmentPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredAndSortedDepartments.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Floating Bulk Actions Bar */}
      {isAdmin && (
        <DepartmentBulkActionsBar
          selectedCount={selectedDeptIds.size}
          onClearSelection={() => setSelectedDeptIds(new Set())}
          onBatchDelete={handleBatchDelete}
          actionLoading={actionLoading}
        />
      )}

      {/* Create / Edit Department Modal */}
      <DepartmentFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleSubmitDeptForm}
        deptForm={deptForm}
        setDeptForm={setDeptForm}
        actionLoading={actionLoading}
        mode={formMode}
      />

      {/* Department Details Modal with Full Assigned Member Roster */}
      <DepartmentDetailsModal
        department={selectedDeptForDetail}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        users={users}
        isAdmin={isAdmin}
        onEdit={(dept) => handleOpenEditModal(dept)}
      />

      {/* Excel / Google Sheets Department Import Modal */}
      <DepartmentImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        existingDepartments={departments}
        onSuccess={loadData}
      />

      {/* Global Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          !actionLoading && setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
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

export default DepartmentManagementView;
