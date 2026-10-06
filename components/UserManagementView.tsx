"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { api, User, Department, UserRole, UserStatus, BookingAccessLevel } from "@/lib/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";
import {
  UserHeader,
  UserStatsCards,
  UserFilterBar,
  UserTable,
  UserCardGrid,
  UserPagination,
  BulkActionsBar,
  UserImportModal,
  UserFormModal,
  UserDetailsModal,
  UserFormData,
  UserSortField,
  SortOrder,
  UserViewMode,
} from "@/components/users";

interface UserManagementViewProps {
  currentUser?: User | null;
}

export function UserManagementView({ currentUser = null }: UserManagementViewProps = {}) {
  const toast = useToast();
  const { user: authUser } = useAuth();
  const effectiveUser = currentUser || authUser;
  const isAdmin = effectiveUser?.role === "ADMIN";

  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [accessFilter, setAccessFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<UserSortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // View Mode & Pagination states
  const [viewMode, setViewMode] = useState<UserViewMode>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Multi-Selection State for Bulk Actions
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Modal and action states
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

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

  // User form state
  const [userForm, setUserForm] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    departmentId: undefined,
    status: "ACTIVE",
    bookingAccess: "FULL_ACCESS",
    avatarUrl: "",
  });

  // Load Data from Backend
  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, deptsData] = await Promise.all([
        api.users.getAll().catch(() => []),
        api.departments.getAll().catch(() => []),
      ]);
      setUsers(usersData || []);
      setDepartments(deptsData || []);
    } catch {
      toast.error("Failed to load user directory from backend.");
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
  }, [searchQuery, roleFilter, statusFilter, departmentFilter, accessFilter, sortBy, sortOrder]);

  // Filtered and Sorted Users
  const filteredAndSortedUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const result = users.filter((u) => {
      const dept = departments.find((d) => d.departmentId === u.departmentId);
      const deptName = dept?.name || u.departmentName || "";

      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        deptName.toLowerCase().includes(q);

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" || (u.status || "ACTIVE") === statusFilter;

      const matchesDept =
        departmentFilter === "ALL" ||
        (departmentFilter === "UNASSIGNED"
          ? !u.departmentId
          : String(u.departmentId) === departmentFilter);

      const matchesAccess =
        accessFilter === "ALL" ||
        (u.bookingAccess || "FULL_ACCESS") === accessFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesDept && matchesAccess;
    });

    result.sort((a, b) => {
      let comp = 0;
      if (sortBy === "name") {
        comp = a.name.localeCompare(b.name);
      } else if (sortBy === "email") {
        comp = a.email.localeCompare(b.email);
      } else if (sortBy === "role") {
        const roleOrder: Record<string, number> = { ADMIN: 1, ORGANIZER: 2, EMPLOYEE: 3 };
        comp = (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
      } else if (sortBy === "status") {
        comp = (a.status || "ACTIVE").localeCompare(b.status || "ACTIVE");
      } else if (sortBy === "department") {
        const deptA = departments.find((d) => d.departmentId === a.departmentId)?.name || a.departmentName || "";
        const deptB = departments.find((d) => d.departmentId === b.departmentId)?.name || b.departmentName || "";
        comp = deptA.localeCompare(deptB);
      } else if (sortBy === "id") {
        comp = a.userId - b.userId;
      }

      return sortOrder === "asc" ? comp : -comp;
    });

    return result;
  }, [users, departments, searchQuery, roleFilter, statusFilter, departmentFilter, sortBy, sortOrder]);

  // Paginated Slices
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedUsers.slice(start, start + pageSize);
  }, [filteredAndSortedUsers, currentPage, pageSize]);

  // Metric Counts for Stat Cards
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => (u.status || "ACTIVE") === "ACTIVE").length;
    const suspended = users.filter((u) => u.status === "SUSPENDED").length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const organizers = users.filter((u) => u.role === "ORGANIZER").length;
    const employees = users.filter((u) => u.role === "EMPLOYEE").length;
    return { total, active, suspended, admins, organizers, employees };
  }, [users]);

  // Reset all filters & sorting
  const handleResetFilters = () => {
    setSearchQuery("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setDepartmentFilter("ALL");
    setAccessFilter("ALL");
    setSortBy("name");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const isFiltered =
    searchQuery !== "" ||
    roleFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    departmentFilter !== "ALL" ||
    accessFilter !== "ALL" ||
    sortBy !== "name" ||
    sortOrder !== "asc";

  // Selection Logic for Checkboxes
  const handleToggleSelectUser = (userId: number) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const isAllCurrentPageSelected = useMemo(() => {
    if (paginatedUsers.length === 0) return false;
    return paginatedUsers.every((u) => selectedUserIds.has(u.userId));
  }, [paginatedUsers, selectedUserIds]);

  const handleToggleSelectAll = () => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (isAllCurrentPageSelected) {
        paginatedUsers.forEach((u) => next.delete(u.userId));
      } else {
        paginatedUsers.forEach((u) => next.add(u.userId));
      }
      return next;
    });
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (filteredAndSortedUsers.length === 0) {
      toast.error("No users to export matching current filters.");
      return;
    }

    try {
      const data = filteredAndSortedUsers.map((u) => {
        const dept = departments.find((d) => d.departmentId === u.departmentId);
        const deptName = dept?.name || u.departmentName || "Unassigned";
        const dateJoined = u.createdAt
          ? new Date(u.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—";

        return {
          "User ID": u.userId,
          "Full Name": u.name,
          "Email Address": u.email,
          "Role": u.role,
          "Job Title": u.jobTitle || "—",
          "Department": deptName,
          "Account Status": u.status || "ACTIVE",
          "Booking Privilege": u.bookingAccess === "VIEW_ONLY" ? "View Only (Probation Staff)" : "Full Access",
          "Phone / Mobile": u.phone || "—",
          "Telegram Connection": u.telegramUsername ? `@${u.telegramUsername.replace("@", "")}` : u.telegramChatId ? `ID: ${u.telegramChatId}` : "Not Linked",
          "Telegram Reminders": u.telegramNotificationsEnabled ? `ON (${u.telegramReminderMinutes || 10}m before)` : "OFF",
          "Date Joined": dateJoined,
          "Avatar URL": u.avatarUrl || "",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users Directory");
      XLSX.writeFile(workbook, `users_directory_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success(`Exported ${filteredAndSortedUsers.length} user records to Excel (.xlsx).`);
    } catch {
      toast.error("Failed to export Excel file.");
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormMode("create");
    setEditingUserId(null);
    setUserForm({
      name: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      departmentId: undefined,
      status: "ACTIVE",
      bookingAccess: "FULL_ACCESS",
      avatarUrl: "",
      jobTitle: "",
      phone: "",
    });
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: User) => {
    setFormMode("edit");
    setEditingUserId(user.userId);
    setUserForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      departmentId: user.departmentId,
      status: user.status || "ACTIVE",
      bookingAccess: user.bookingAccess || "FULL_ACCESS",
      avatarUrl: user.avatarUrl || "",
      jobTitle: user.jobTitle || "",
      phone: user.phone || "",
    });
    setFormModalOpen(true);
  };

  // Open View Details Modal
  const handleViewUser = (user: User) => {
    setSelectedUserForDetail(user);
    setDetailModalOpen(true);
  };

  // Handle Form Submit (Create or Update)
  const handleSubmitUserForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formMode === "create" && !userForm.password) {
      toast.error("Password is required for new accounts.");
      return;
    }

    setActionLoading(true);
    try {
      if (formMode === "create") {
        await api.users.create({
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role,
          departmentId: userForm.departmentId ? Number(userForm.departmentId) : undefined,
          status: userForm.status || "ACTIVE",
          bookingAccess: userForm.bookingAccess || "FULL_ACCESS",
          avatarUrl: userForm.avatarUrl?.trim() || undefined,
          jobTitle: userForm.jobTitle?.trim() || undefined,
          phone: userForm.phone?.trim() || undefined,
        });
        toast.success(`User "${userForm.name}" created successfully.`);
      } else if (formMode === "edit" && editingUserId) {
        await api.users.update(editingUserId, {
          name: userForm.name,
          email: userForm.email,
          password: userForm.password ? userForm.password : undefined,
          role: userForm.role,
          departmentId: userForm.departmentId ? Number(userForm.departmentId) : undefined,
          status: userForm.status || "ACTIVE",
          bookingAccess: userForm.bookingAccess || "FULL_ACCESS",
          avatarUrl: userForm.avatarUrl?.trim() || undefined,
          jobTitle: userForm.jobTitle?.trim() || undefined,
          phone: userForm.phone?.trim() || undefined,
        });
        toast.success(`User "${userForm.name}" updated successfully.`);
      }

      setFormModalOpen(false);
      setUserForm({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
        departmentId: undefined,
        status: "ACTIVE",
        bookingAccess: "FULL_ACCESS",
        avatarUrl: "",
        jobTitle: "",
        phone: "",
      });
      loadData();
    } catch (err: any) {
      toast.error(
        err?.message ||
          `Failed to ${formMode === "create" ? "create" : "update"} user account.`
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Toggle Single User Status (Active <-> Suspended)
  const handleToggleUserStatus = async (user: User) => {
    if (effectiveUser && effectiveUser.userId === user.userId) {
      toast.error("You cannot change your own account status.");
      return;
    }

    const nextStatus: UserStatus = user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    setActionLoading(true);
    try {
      await api.users.updateStatus(user.userId, nextStatus);
      toast.success(
        `User "${user.name}" account is now ${nextStatus.toLowerCase()}.`
      );
      loadData();
    } catch (err: any) {
      toast.error(err?.message || `Failed to update status for ${user.name}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Toggle Single User Booking Access (Full Access <-> View Only)
  const handleToggleBookingAccess = async (user: User) => {
    const nextAccess: BookingAccessLevel =
      user.bookingAccess === "VIEW_ONLY" ? "FULL_ACCESS" : "VIEW_ONLY";
    setActionLoading(true);
    try {
      await api.users.updateBookingAccess(user.userId, nextAccess);
      toast.success(
        nextAccess === "VIEW_ONLY"
          ? `User "${user.name}" set to View Only (probation / restricted from booking).`
          : `User "${user.name}" granted Full Access (booking permitted).`
      );
      loadData();
    } catch (err: any) {
      toast.error(err?.message || `Failed to update booking access for ${user.name}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Batch Change Booking Access
  const handleBatchChangeBookingAccess = async (access: BookingAccessLevel) => {
    if (selectedUserIds.size === 0) return;
    setActionLoading(true);
    try {
      await Promise.all(
        Array.from(selectedUserIds).map((id) =>
          api.users.updateBookingAccess(id, access)
        )
      );
      toast.success(
        `Updated booking access to ${access === "VIEW_ONLY" ? "View Only (Probation Staff)" : "Full Access"} for ${selectedUserIds.size} users.`
      );
      setSelectedUserIds(new Set());
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to batch update booking access.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Single User
  const handleDeleteUser = (id: number, name: string) => {
    if (effectiveUser && effectiveUser.userId === id) {
      toast.error("You cannot delete your own account.");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Delete User Account",
      message: `Are you sure you want to permanently delete user "${name}"? This action cannot be undone and will revoke their system access.`,
      variant: "danger",
      confirmText: "Delete User",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await api.users.delete(id);
          toast.success(`User "${name}" deleted.`);
          setSelectedUserIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          loadData();
        } catch (err: any) {
          toast.error(err?.message || "Failed to delete user account.");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Bulk Action: Batch Reassign Department
  const handleBatchChangeDepartment = async (departmentId?: number) => {
    setActionLoading(true);
    let success = 0;
    for (const id of Array.from(selectedUserIds)) {
      const user = users.find((u) => u.userId === id);
      if (!user) continue;
      try {
        await api.users.update(id, {
          name: user.name,
          email: user.email,
          role: user.role,
          departmentId,
        });
        success++;
      } catch {}
    }
    setActionLoading(false);
    toast.success(`Reassigned department for ${success} members.`);
    setSelectedUserIds(new Set());
    loadData();
  };

  // Bulk Action: Batch Change Role
  const handleBatchChangeRole = async (role: UserRole) => {
    setActionLoading(true);
    let success = 0;
    for (const id of Array.from(selectedUserIds)) {
      const user = users.find((u) => u.userId === id);
      if (!user) continue;
      try {
        await api.users.update(id, {
          name: user.name,
          email: user.email,
          role,
          departmentId: user.departmentId,
        });
        success++;
      } catch {}
    }
    setActionLoading(false);
    toast.success(`Updated role to ${role} for ${success} members.`);
    setSelectedUserIds(new Set());
    loadData();
  };

  // Bulk Action: Batch Change Account Status
  const handleBatchChangeStatus = async (status: UserStatus) => {
    setActionLoading(true);
    let success = 0;
    for (const id of Array.from(selectedUserIds)) {
      if (effectiveUser && effectiveUser.userId === id) continue; // Don't self-suspend
      try {
        await api.users.updateStatus(id, status);
        success++;
      } catch {}
    }
    setActionLoading(false);
    toast.success(`Set status to ${status} for ${success} members.`);
    setSelectedUserIds(new Set());
    loadData();
  };

  // Bulk Action: Batch Delete
  const handleBatchDelete = () => {
    const toDeleteIds = Array.from(selectedUserIds).filter(
      (id) => !effectiveUser || effectiveUser.userId !== id
    );

    if (toDeleteIds.length === 0) {
      toast.error("Cannot delete your own account.");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: `Delete ${toDeleteIds.length} User Accounts`,
      message: `Are you sure you want to permanently delete these ${toDeleteIds.length} selected user accounts? This cannot be undone.`,
      variant: "danger",
      confirmText: "Delete Selected",
      onConfirm: async () => {
        setActionLoading(true);
        let success = 0;
        for (const id of toDeleteIds) {
          try {
            await api.users.delete(id);
            success++;
          } catch {}
        }
        setActionLoading(false);
        toast.success(`Permanently deleted ${success} users.`);
        setSelectedUserIds(new Set());
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        loadData();
      },
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Banner with Refresh, Import, and Add User */}
      <UserHeader
        isAdmin={isAdmin}
        loading={loading}
        onRefresh={loadData}
        onAddUser={handleOpenCreateModal}
        onImportUsers={() => setImportModalOpen(true)}
      />

      {/* Quick Metrics Bar */}
      <UserStatsCards stats={stats} />

      {/* Search & Filter Bar and Users Directory View */}
      <div className="space-y-1.5">
        <UserFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          accessFilter={accessFilter}
          onAccessFilterChange={setAccessFilter}
          departments={departments}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onToggleSortOrder={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
          onResetFilters={handleResetFilters}
          isFiltered={isFiltered}
          totalResults={filteredAndSortedUsers.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onExportExcel={handleExportExcel}
        />

        {/* Main Users View: Table or Card Grid */}
        {viewMode === "table" ? (
          <UserTable
            users={paginatedUsers}
            departments={departments}
            loading={loading}
            isAdmin={isAdmin}
            actionLoading={actionLoading}
            currentUserId={effectiveUser?.userId}
            selectedUserIds={selectedUserIds}
            onToggleSelectUser={handleToggleSelectUser}
            onToggleSelectAll={handleToggleSelectAll}
            isAllSelected={isAllCurrentPageSelected}
            onViewUser={handleViewUser}
            onEditUser={handleOpenEditModal}
            onDeleteUser={handleDeleteUser}
            onToggleStatus={handleToggleUserStatus}
            onToggleBookingAccess={handleToggleBookingAccess}
          />
        ) : (
          <UserCardGrid
            users={paginatedUsers}
            departments={departments}
            loading={loading}
            isAdmin={isAdmin}
            actionLoading={actionLoading}
            currentUserId={effectiveUser?.userId}
            selectedUserIds={selectedUserIds}
            onToggleSelectUser={handleToggleSelectUser}
            onViewUser={handleViewUser}
            onEditUser={handleOpenEditModal}
            onDeleteUser={handleDeleteUser}
            onToggleStatus={handleToggleUserStatus}
            onToggleBookingAccess={handleToggleBookingAccess}
          />
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && filteredAndSortedUsers.length > 0 && (
        <UserPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredAndSortedUsers.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Floating Bulk Actions Bar */}
      {isAdmin && (
        <BulkActionsBar
          selectedCount={selectedUserIds.size}
          departments={departments}
          onClearSelection={() => setSelectedUserIds(new Set())}
          onBatchChangeDepartment={handleBatchChangeDepartment}
          onBatchChangeRole={handleBatchChangeRole}
          onBatchChangeStatus={handleBatchChangeStatus}
          onBatchChangeBookingAccess={handleBatchChangeBookingAccess}
          onBatchDelete={handleBatchDelete}
          actionLoading={actionLoading}
        />
      )}

      {/* Import from Excel / Google Sheets Modal */}
      <UserImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        departments={departments}
        existingUsers={users}
        onSuccess={loadData}
      />

      {/* Create / Edit User Modal with Password Generator */}
      <UserFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleSubmitUserForm}
        userForm={userForm}
        setUserForm={setUserForm}
        departments={departments}
        actionLoading={actionLoading}
        mode={formMode}
      />

      {/* User Details Modal with Meeting Engagement Activity */}
      <UserDetailsModal
        user={selectedUserForDetail}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        departments={departments}
        isAdmin={isAdmin}
        onEdit={(user) => handleOpenEditModal(user)}
        onToggleStatus={handleToggleUserStatus}
        onToggleBookingAccess={handleToggleBookingAccess}
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

export default UserManagementView;
