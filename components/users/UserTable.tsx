import React from "react";
import {
  Users,
  Mail,
  Building,
  Trash2,
  Pencil,
  Eye,
  ShieldAlert,
  ShieldCheck,
  CalendarCheck,
  Lock,
  Phone,
  Briefcase,
  Send,
  Calendar,
  Bell,
  BellOff,
} from "lucide-react";
import { User, Department } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { BookingAccessBadge } from "./BookingAccessBadge";
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
  onToggleBookingAccess?: (user: User) => void;
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
  onToggleBookingAccess,
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

  const hasCheckbox = isAdmin && !!onToggleSelectAll;
  const memberStickyLeft = hasCheckbox ? 40 : 0;
  const actionsStickyLeft = hasCheckbox ? 300 : 260;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Scrollable Container with smooth horizontal scrollbar */}
      <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <table className="w-full text-left border-separate border-spacing-0 text-xs min-w-[1560px]">
          <colgroup>
            {hasCheckbox && <col style={{ width: 40 }} />}
            <col style={{ width: 260 }} />
            <col style={{ width: 170 }} />
          </colgroup>

          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {/* PINNED 1: Checkbox */}
              {hasCheckbox && (
                <th
                  style={{ left: 0, width: 40, minWidth: 40, maxWidth: 40, backgroundColor: "#f8fafc" }}
                  className="py-2.5 px-3 sticky z-30 border-b border-slate-200 border-r border-slate-100"
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected && users.length > 0}
                    onChange={onToggleSelectAll}
                    className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    title="Select All on page"
                  />
                </th>
              )}

              {/* PINNED 2: Member Profile */}
              <th
                style={{
                  left: memberStickyLeft,
                  width: 260,
                  minWidth: 260,
                  maxWidth: 260,
                  backgroundColor: "#f8fafc",
                }}
                className="py-2.5 px-4 sticky z-30 border-b border-slate-200 border-r border-slate-100"
              >
                Member Profile
              </th>

              {/* PINNED 3: Actions (Pinned together with Member Profile) */}
              <th
                style={{
                  left: actionsStickyLeft,
                  width: 170,
                  minWidth: 170,
                  maxWidth: 170,
                  backgroundColor: "#f8fafc",
                }}
                className="py-2.5 px-4 sticky z-30 border-b border-slate-200 border-r-2 border-slate-300 shadow-[4px_0_12px_rgba(0,0,0,0.08)]"
              >
                Actions
              </th>

              {/* SCROLLABLE: User ID */}
              <th className="py-2.5 px-3.5 min-w-[80px] bg-slate-50 border-b border-slate-200">ID</th>

              {/* SCROLLABLE: System Role */}
              <th className="py-2.5 px-3.5 min-w-[120px] bg-slate-50 border-b border-slate-200">Role</th>

              {/* SCROLLABLE: Job Title */}
              <th className="py-2.5 px-3.5 min-w-[180px] bg-slate-50 border-b border-slate-200">Job Title</th>

              {/* SCROLLABLE: Department */}
              <th className="py-2.5 px-3.5 min-w-[170px] bg-slate-50 border-b border-slate-200">Department</th>

              {/* SCROLLABLE: Account Status */}
              <th className="py-2.5 px-3.5 min-w-[120px] bg-slate-50 border-b border-slate-200">Account Status</th>

              {/* SCROLLABLE: Booking Access / Probation */}
              <th className="py-2.5 px-3.5 min-w-[180px] bg-slate-50 border-b border-slate-200">Booking Privilege</th>

              {/* SCROLLABLE: Phone Contact */}
              <th className="py-2.5 px-3.5 min-w-[150px] bg-slate-50 border-b border-slate-200">Phone Number</th>

              {/* SCROLLABLE: Telegram Integration */}
              <th className="py-2.5 px-3.5 min-w-[190px] bg-slate-50 border-b border-slate-200">Telegram Alerts</th>

              {/* SCROLLABLE: Date Joined */}
              <th className="py-2.5 px-3.5 min-w-[130px] bg-slate-50 border-b border-slate-200">Date Joined</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => {
              const dept = departments.find((d) => d.departmentId === u.departmentId);
              const isSelf = currentUserId !== undefined && u.userId === currentUserId;
              const isSelected = selectedUserIds.has(u.userId);

              // Solid, 100% opaque background colors for pinned cells to completely prevent see-through
              const pinnedBgClass = isSelected
                ? "bg-[#eef2ff] group-hover:bg-[#e0e7ff]"
                : "bg-white group-hover:bg-[#f8fafc]";

              // Date joined formatting
              const formattedDate = u.createdAt
                ? new Date(u.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              return (
                <tr
                  key={u.userId}
                  className={`group transition-colors ${
                    isSelected ? "bg-[#eef2ff]" : "hover:bg-[#f8fafc]"
                  }`}
                >
                  {/* PINNED 1: Checkbox */}
                  {hasCheckbox && (
                    <td
                      style={{
                        left: 0,
                        width: 40,
                        minWidth: 40,
                        maxWidth: 40,
                      }}
                      className={`py-2.5 px-3 sticky z-20 border-b border-slate-100 border-r border-slate-100 ${pinnedBgClass}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectUser?.(u.userId)}
                        className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                  )}

                  {/* PINNED 2: Member (Avatar + Name + Email) */}
                  <td
                    style={{
                      left: memberStickyLeft,
                      width: 260,
                      minWidth: 260,
                      maxWidth: 260,
                    }}
                    className={`py-2.5 px-4 sticky z-20 border-b border-slate-100 border-r border-slate-100 ${pinnedBgClass}`}
                  >
                    <div
                      className="flex items-center gap-2.5 cursor-pointer"
                      onClick={() => onViewUser(u)}
                    >
                      <UserAvatar
                        name={u.name}
                        avatarUrl={u.avatarUrl}
                        status={u.status}
                        size="sm"
                        showStatusIndicator
                        className="group-hover:scale-105 transition-transform shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate text-xs group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                          <span className="truncate">{u.name}</span>
                          {isSelf && (
                            <span className="shrink-0 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
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

                  {/* PINNED 3: Actions (Pinned next to Member Profile with solid opaque bg) */}
                  <td
                    style={{
                      left: actionsStickyLeft,
                      width: 170,
                      minWidth: 170,
                      maxWidth: 170,
                    }}
                    className={`py-2.5 px-4 sticky z-20 border-b border-slate-100 border-r-2 border-slate-300 shadow-[4px_0_12px_rgba(0,0,0,0.08)] ${pinnedBgClass}`}
                  >
                    <div className="inline-flex items-center gap-1 justify-start">
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

                      {/* Quick Toggle Booking Access (Probation / Full Access) */}
                      {isAdmin && onToggleBookingAccess && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onToggleBookingAccess(u)}
                          disabled={actionLoading}
                          title={
                            u.bookingAccess === "VIEW_ONLY"
                              ? "Grant Full Access (Passed Probation)"
                              : "Restrict to View Only (Probation Staff)"
                          }
                          className={`hover:bg-slate-100 ${
                            u.bookingAccess === "VIEW_ONLY"
                              ? "text-amber-600 hover:text-amber-700 bg-amber-50"
                              : "text-slate-400 hover:text-indigo-600"
                          }`}
                        >
                          {u.bookingAccess === "VIEW_ONLY" ? (
                            <CalendarCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
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

                  {/* SCROLLABLE: ID */}
                  <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-400 font-semibold border-b border-slate-100">
                    #{u.userId}
                  </td>

                  {/* SCROLLABLE: Role */}
                  <td className="py-2.5 px-3.5 whitespace-nowrap border-b border-slate-100">
                    <UserRoleBadge role={u.role} />
                  </td>

                  {/* SCROLLABLE: Job Title */}
                  <td className="py-2.5 px-3.5 border-b border-slate-100">
                    {u.jobTitle ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium truncate max-w-[200px]" title={u.jobTitle}>
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{u.jobTitle}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">—</span>
                    )}
                  </td>

                  {/* SCROLLABLE: Department */}
                  <td className="py-2.5 px-3.5 whitespace-nowrap border-b border-slate-100">
                    <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {dept?.name || u.departmentName || "Unassigned"}
                    </span>
                  </td>

                  {/* SCROLLABLE: Status */}
                  <td className="py-2.5 px-3.5 whitespace-nowrap border-b border-slate-100">
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

                  {/* SCROLLABLE: Booking Access */}
                  <td className="py-2.5 px-3.5 whitespace-nowrap border-b border-slate-100">
                    <BookingAccessBadge
                      access={u.bookingAccess}
                      interactive={isAdmin}
                      onToggle={() => onToggleBookingAccess?.(u)}
                      title={
                        isAdmin
                          ? `Click to toggle: ${
                              u.bookingAccess === "VIEW_ONLY"
                                ? "Grant Full Access (Passed Probation)"
                                : "Set View Only (Probation Staff)"
                            }`
                          : undefined
                      }
                    />
                  </td>

                  {/* SCROLLABLE: Phone */}
                  <td className="py-2.5 px-3.5 whitespace-nowrap border-b border-slate-100">
                    {u.phone ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        {u.phone}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">—</span>
                    )}
                  </td>

                  {/* SCROLLABLE: Telegram */}
                  <td className="py-2.5 px-3.5 whitespace-nowrap border-b border-slate-100">
                    {u.telegramUsername ? (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://t.me/${u.telegramUsername.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 transition-colors"
                          title="Open Telegram Chat"
                        >
                          <Send className="w-2.5 h-2.5" />
                          @{u.telegramUsername.replace("@", "")}
                        </a>
                        {u.telegramNotificationsEnabled ? (
                          <span title={`Reminders ON (${u.telegramReminderMinutes || 10}m before)`} className="inline-flex">
                            <Bell className="w-3 h-3 text-emerald-500 shrink-0" />
                          </span>
                        ) : (
                          <span title="Notifications Disabled" className="inline-flex">
                            <BellOff className="w-3 h-3 text-slate-300 shrink-0" />
                          </span>
                        )}
                      </div>
                    ) : u.telegramChatId ? (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          ID: {u.telegramChatId}
                        </span>
                        {u.telegramNotificationsEnabled ? (
                          <span title="Reminders ON" className="inline-flex">
                            <Bell className="w-3 h-3 text-emerald-500 shrink-0" />
                          </span>
                        ) : (
                          <span title="Notifications Disabled" className="inline-flex">
                            <BellOff className="w-3 h-3 text-slate-300 shrink-0" />
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Not linked</span>
                    )}
                  </td>

                  {/* SCROLLABLE: Date Joined */}
                  <td className="py-2.5 px-3.5 whitespace-nowrap border-b border-slate-100">
                    <span className="inline-flex items-center gap-1 text-slate-600 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      {formattedDate}
                    </span>
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
