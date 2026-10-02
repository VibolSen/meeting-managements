import React from "react";
import { Users, Mail, Building, Trash2, Pencil, Eye, ShieldAlert, ShieldCheck } from "lucide-react";
import { User, Department } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserAvatar } from "./UserAvatar";

interface UserTableProps {
  users: User[];
  departments: Department[];
  loading: boolean;
  isAdmin: boolean;
  actionLoading: boolean;
  currentUserId?: number;
  selectedUserIds?: Set<number>;
  onToggleSelectUser?: (userId: number) => void;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: number, userName: string) => void;
  onToggleStatus?: (user: User) => void;
}

export function UserTable({
  users,
  departments,
  loading,
  isAdmin,
  actionLoading,
  currentUserId,
  selectedUserIds = new Set(),
  onToggleSelectUser,
  onToggleSelectAll,
  isAllSelected = false,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onToggleStatus,
}: UserTableProps) {
  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs">Loading users directory...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
        <h3 className="text-sm font-semibold text-slate-800">No users found</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Try adjusting your search criteria or add a new user.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isAdmin && onToggleSelectAll && (
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={isAllSelected && users.length > 0}
                    onChange={onToggleSelectAll}
                    className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    title="Select All on page"
                  />
                </th>
              )}
              <th className="py-2.5 px-3.5">Member</th>
              <th className="py-2.5 px-3.5">Role</th>
              <th className="py-2.5 px-3.5">Department</th>
              <th className="py-2.5 px-3.5">Status</th>
              <th className="py-2.5 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => {
              const dept = departments.find((d) => d.departmentId === u.departmentId);
              const isSelf = currentUserId !== undefined && u.userId === currentUserId;
              const isSelected = selectedUserIds.has(u.userId);

              return (
                <tr
                  key={u.userId}
                  className={`transition-colors ${
                    isSelected ? "bg-indigo-50/40" : "hover:bg-slate-50/70"
                  }`}
                >
                  {isAdmin && onToggleSelectUser && (
                    <td className="py-2.5 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectUser(u.userId)}
                        className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="py-2.5 px-3.5">
                    <div
                      className="flex items-center gap-2.5 cursor-pointer group"
                      onClick={() => onViewUser(u)}
                    >
                      <UserAvatar
                        name={u.name}
                        avatarUrl={u.avatarUrl}
                        status={u.status}
                        size="sm"
                        showStatusIndicator
                        className="group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate text-xs group-hover:text-indigo-600 transition-colors">
                          {u.name}
                          {isSelf && (
                            <span className="ml-1.5 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-300 shrink-0" />
                          <span className="truncate">{u.email}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5">
                    <UserRoleBadge role={u.role} />
                  </td>
                  <td className="py-2.5 px-3.5">
                    <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                      <Building className="w-3 h-3 text-slate-400 shrink-0" />
                      {dept?.name || u.departmentName || "Unassigned"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5">
                    <UserStatusBadge
                      status={u.status}
                      interactive={isAdmin && !isSelf}
                      onToggle={() => onToggleStatus?.(u)}
                      title={
                        isSelf
                          ? "Cannot change your own account status"
                          : isAdmin
                          ? `Click to ${u.status === "SUSPENDED" ? "activate" : "suspend"} account`
                          : undefined
                      }
                    />
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      {/* View Details Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onViewUser(u)}
                        title="View Details"
                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      {/* Edit User Button */}
                      {isAdmin && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEditUser(u)}
                          disabled={actionLoading}
                          title="Edit User"
                          className="text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      {/* Quick Suspend / Activate Button */}
                      {isAdmin && onToggleStatus && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onToggleStatus(u)}
                          disabled={actionLoading || isSelf}
                          title={
                            isSelf
                              ? "Cannot change your own account status"
                              : u.status === "SUSPENDED"
                              ? "Activate Account"
                              : "Suspend Account"
                          }
                          className={
                            isSelf
                              ? "text-slate-300 opacity-30 cursor-not-allowed hover:bg-transparent"
                              : u.status === "SUSPENDED"
                              ? "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                              : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          }
                        >
                          {u.status === "SUSPENDED" ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      )}

                      {/* Delete User Button */}
                      {isAdmin && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDeleteUser(u.userId, u.name)}
                          disabled={actionLoading || isSelf}
                          title={isSelf ? "Cannot delete your own account" : "Delete User"}
                          className={
                            isSelf
                              ? "text-slate-300 opacity-30 cursor-not-allowed hover:bg-transparent"
                              : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
