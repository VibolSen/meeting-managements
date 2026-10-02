import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Department, User } from "@/lib/api";
import { UserAvatar } from "@/components/users/UserAvatar";
import { UserRoleBadge } from "@/components/users/UserRoleBadge";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import {
  Building,
  Users,
  Shield,
  Pencil,
  Mail,
  Info,
} from "lucide-react";

interface DepartmentDetailsModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  isAdmin: boolean;
  onEdit?: (department: Department) => void;
}

export function DepartmentDetailsModal({
  department,
  isOpen,
  onClose,
  users,
  isAdmin,
  onEdit,
}: DepartmentDetailsModalProps) {
  if (!department) return null;

  const deptUsers = users.filter((u) => u.departmentId === department.departmentId);
  const adminsCount = deptUsers.filter((u) => u.role === "ADMIN").length;
  const organizersCount = deptUsers.filter((u) => u.role === "ORGANIZER").length;
  const employeesCount = deptUsers.filter((u) => u.role === "EMPLOYEE").length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Department Details">
      <div className="space-y-4">
        {/* Department Header Card */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-xs shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base truncate">
                {department.name}
              </h3>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                #{department.departmentId}
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
              {department.description || "No description provided for this department."}
            </p>
          </div>
        </div>

        {/* Member Allocation Metrics */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
              Total Members
            </span>
            <p className="text-lg font-extrabold text-indigo-900 mt-0.5">
              {deptUsers.length}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-violet-50/50 border border-violet-100">
            <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">
              Organizers
            </span>
            <p className="text-lg font-extrabold text-violet-900 mt-0.5">
              {organizersCount}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Employees / Admins
            </span>
            <p className="text-lg font-extrabold text-slate-800 mt-0.5">
              {employeesCount + adminsCount}
            </p>
          </div>
        </div>

        {/* Member Roster Section */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Assigned Team Members ({deptUsers.length})
            </span>
          </div>

          {deptUsers.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <Info className="w-6 h-6 mx-auto mb-1 stroke-[1.5] text-slate-300" />
              <p className="text-xs">No team members currently assigned to this department.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Assign users via User Management or edit their profile.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {deptUsers.map((u) => (
                <div
                  key={u.userId}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar
                      name={u.name}
                      avatarUrl={u.avatarUrl}
                      status={u.status}
                      size="xs"
                      showStatusIndicator
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate text-xs">{u.name}</p>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-300" />
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <UserStatusBadge status={u.status} />
                    <UserRoleBadge role={u.role} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          {isAdmin && onEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(department);
              }}
              leftIcon={<Pencil className="w-3.5 h-3.5" />}
            >
              Edit Department
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
