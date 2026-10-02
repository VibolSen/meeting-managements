"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Building,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { api, User, Department } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";

interface DepartmentManagementViewProps {
  currentUser?: User | null;
}

export function DepartmentManagementView({ currentUser = null }: DepartmentManagementViewProps = {}) {
  const toast = useToast();
  const { user: authUser } = useAuth();
  const effectiveUser = currentUser || authUser;
  const isAdmin = effectiveUser?.role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Modal and action states
  const [deptModalOpen, setDeptModalOpen] = useState(false);
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
  const [deptForm, setDeptForm] = useState<{
    name: string;
  }>({
    name: "",
  });

  // Load Data
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

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [departments, searchQuery]);

  // Department Metrics
  const stats = useMemo(() => {
    const totalDepts = departments.length;
    const assignedMembers = users.filter((u) => u.departmentId).length;
    const unassignedMembers = users.filter((u) => !u.departmentId).length;
    return { totalDepts, assignedMembers, unassignedMembers };
  }, [departments, users]);

  // Handle Create Department
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name.trim()) {
      toast.error("Department name is required.");
      return;
    }

    setActionLoading(true);
    try {
      await api.departments.create({
        name: deptForm.name.trim(),
      });
      toast.success("Department created successfully.");
      setDeptModalOpen(false);
      setDeptForm({ name: "" });
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create department.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Department
  const handleDeleteDepartment = (id: number, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Department",
      message: `Are you sure you want to delete department "${name}"? Existing team members assigned to this department will need reassignment.`,
      variant: "danger",
      confirmText: "Delete Department",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await api.departments.delete(id);
          toast.success(`Department "${name}" deleted.`);
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

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Department Management
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure company divisions, teams, department leadership, and organizational allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={loading}
            className="h-8.5 text-xs px-3"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setDeptModalOpen(true)}
              className="h-8.5 text-xs px-3 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Department
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Departments</p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.totalDepts}</p>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Assigned Members</p>
          <p className="text-xl font-extrabold text-indigo-900 mt-0.5">{stats.assignedMembers}</p>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Unassigned Members</p>
          <p className="text-xl font-extrabold text-amber-800 mt-0.5">{stats.unassignedMembers}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search departments by name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs">Loading departments...</span>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
          <Building className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
          <h3 className="text-sm font-semibold text-slate-800">No departments found</h3>
          <p className="text-xs text-slate-400 mt-0.5">Create your first department to organize staff and meetings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDepartments.map((d) => {
            const deptUsers = users.filter((u) => u.departmentId === d.departmentId);
            return (
              <div
                key={d.departmentId}
                className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <Building className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">{d.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Department #{d.departmentId}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteDepartment(d.departmentId, d.name)}
                      disabled={actionLoading}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{deptUsers.length} Assigned Members</span>
                  </span>

                  {deptUsers.length > 0 && (
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {deptUsers.slice(0, 3).map((u) => (
                        <div
                          key={u.userId}
                          title={u.name}
                          className="w-5.5 h-5.5 rounded-full bg-indigo-600 text-white font-extrabold text-[9px] flex items-center justify-center ring-2 ring-white"
                        >
                          {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      ))}
                      {deptUsers.length > 3 && (
                        <div className="w-5.5 h-5.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                          +{deptUsers.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Department Modal */}
      <Modal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title="Create New Department"
      >
        <form onSubmit={handleSaveDepartment} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department Name</label>
            <Input
              type="text"
              required
              placeholder="e.g. Engineering, Marketing, Finance"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ name: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeptModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={actionLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Create Department
            </Button>
          </div>
        </form>
      </Modal>

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

export default DepartmentManagementView;
