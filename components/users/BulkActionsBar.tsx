import React, { useState } from "react";
import { Building, Shield, Trash2, X, Check, Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Department, UserRole, UserStatus } from "@/lib/api";

interface BulkActionsBarProps {
  selectedCount: number;
  departments: Department[];
  onClearSelection: () => void;
  onBatchChangeDepartment: (departmentId?: number) => Promise<void>;
  onBatchChangeRole: (role: UserRole) => Promise<void>;
  onBatchChangeStatus?: (status: UserStatus) => Promise<void>;
  onBatchDelete: () => void;
  actionLoading: boolean;
}

export function BulkActionsBar({
  selectedCount,
  departments,
  onClearSelection,
  onBatchChangeDepartment,
  onBatchChangeRole,
  onBatchChangeStatus,
  onBatchDelete,
  actionLoading,
}: BulkActionsBarProps) {
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>(undefined);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("EMPLOYEE");

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>("ACTIVE");

  if (selectedCount === 0) return null;

  return (
    <>
      {/* Floating Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl shadow-2xl p-2 px-3 sm:px-4 flex items-center gap-2 sm:gap-3 border border-slate-700/80 animate-in slide-in-from-bottom-5 duration-200">
        <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-slate-700">
          <span className="w-6 h-6 rounded-lg bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center">
            {selectedCount}
          </span>
          <span className="text-xs font-semibold hidden sm:inline">Selected</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Batch Status */}
          {onBatchChangeStatus && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStatusModalOpen(true)}
              leftIcon={<UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
              className="text-xs text-slate-200 hover:text-white hover:bg-slate-800 h-8 px-2.5"
              disabled={actionLoading}
            >
              Set Status
            </Button>
          )}

          {/* Batch Department */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeptModalOpen(true)}
            leftIcon={<Building className="w-3.5 h-3.5 text-indigo-400" />}
            className="text-xs text-slate-200 hover:text-white hover:bg-slate-800 h-8 px-2.5"
            disabled={actionLoading}
          >
            Reassign Dept
          </Button>

          {/* Batch Role */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setRoleModalOpen(true)}
            leftIcon={<Shield className="w-3.5 h-3.5 text-indigo-400" />}
            className="text-xs text-slate-200 hover:text-white hover:bg-slate-800 h-8 px-2.5"
            disabled={actionLoading}
          >
            Change Role
          </Button>

          {/* Batch Delete */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBatchDelete}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
            className="text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/50 h-8 px-2.5"
            disabled={actionLoading}
          >
            Delete
          </Button>

          {/* Clear Selection */}
          <button
            type="button"
            onClick={onClearSelection}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer ml-1"
            title="Clear Selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Batch Status Modal */}
      {onBatchChangeStatus && (
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title={`Set Account Status (${selectedCount} Users)`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Select the account status to assign to all <strong>{selectedCount}</strong> selected member accounts.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as UserStatus)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="ACTIVE">ACTIVE (Full access permitted)</option>
                <option value="SUSPENDED">SUSPENDED (System login blocked)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatusModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={actionLoading}
                onClick={async () => {
                  await onBatchChangeStatus(selectedStatus);
                  setStatusModalOpen(false);
                }}
              >
                Apply to {selectedCount} Users
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Batch Department Modal */}
      <Modal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title={`Reassign Department (${selectedCount} Users)`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Select the new department affiliation to apply to all{" "}
            <strong>{selectedCount}</strong> selected member accounts.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Department
            </label>
            <select
              value={selectedDeptId ?? ""}
              onChange={(e) =>
                setSelectedDeptId(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="">None (Unassign Department)</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.name}
                </option>
              ))}
            </select>
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
              type="button"
              variant="primary"
              size="sm"
              isLoading={actionLoading}
              onClick={async () => {
                await onBatchChangeDepartment(selectedDeptId);
                setDeptModalOpen(false);
              }}
            >
              Apply to {selectedCount} Users
            </Button>
          </div>
        </div>
      </Modal>

      {/* Batch Role Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={`Change System Role (${selectedCount} Users)`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Choose the new security access level to apply to all{" "}
            <strong>{selectedCount}</strong> selected members.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="EMPLOYEE">EMPLOYEE (Standard Access)</option>
              <option value="ORGANIZER">ORGANIZER (Meeting Creation)</option>
              <option value="ADMIN">ADMIN (Full Administrative Control)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRoleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={actionLoading}
              onClick={async () => {
                await onBatchChangeRole(selectedRole);
                setRoleModalOpen(false);
              }}
            >
              Apply to {selectedCount} Users
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
