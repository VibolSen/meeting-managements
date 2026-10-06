import { Users, Mail, Building, Trash2, Pencil, Eye, ShieldAlert, ShieldCheck, CalendarCheck, Lock, Briefcase, Phone, Send, Calendar } from "lucide-react";
import { User, Department } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { BookingAccessBadge } from "./BookingAccessBadge";
import { UserAvatar } from "./UserAvatar";

interface UserCardGridProps {
  users: User[];
  departments: Department[];
  loading: boolean;
  isAdmin: boolean;
  actionLoading: boolean;
  currentUserId?: number;
  selectedUserIds?: Set<number>;
  onToggleSelectUser?: (userId: number) => void;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: number, userName: string) => void;
  onToggleStatus?: (user: User) => void;
  onToggleBookingAccess?: (user: User) => void;
}

export function UserCardGrid({
  users,
  departments,
  loading,
  isAdmin,
  actionLoading,
  currentUserId,
  selectedUserIds = new Set(),
  onToggleSelectUser,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onToggleStatus,
  onToggleBookingAccess,
}: UserCardGridProps) {
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
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
      {users.map((u) => {
        const dept = departments.find((d) => d.departmentId === u.departmentId);
        const isSelf = currentUserId !== undefined && u.userId === currentUserId;
        const isSelected = selectedUserIds.has(u.userId);

        return (
          <div
            key={u.userId}
            className={`p-4 rounded-xl border transition-all bg-white relative flex flex-col justify-between ${
              isSelected
                ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
            }`}
          >
            {/* Top row: Checkbox, ID, Role Badge & Status Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                {isAdmin && onToggleSelectUser && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelectUser(u.userId)}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                )}
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  #{u.userId}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <BookingAccessBadge
                  access={u.bookingAccess}
                  interactive={isAdmin}
                  onToggle={() => onToggleBookingAccess?.(u)}
                />
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
                <UserRoleBadge role={u.role} />
              </div>
            </div>

            {/* Profile info */}
            <div className="flex items-start gap-3">
              <div
                onClick={() => onViewUser(u)}
                className="cursor-pointer hover:opacity-95 transition-opacity"
              >
                <UserAvatar
                  name={u.name}
                  avatarUrl={u.avatarUrl}
                  status={u.status}
                  size="lg"
                  showStatusIndicator
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4
                    onClick={() => onViewUser(u)}
                    className="font-bold text-slate-900 text-sm truncate cursor-pointer hover:text-indigo-600 transition-colors"
                  >
                    {u.name}
                  </h4>
                  {isSelf && (
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                      You
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{u.email}</span>
                </p>

                {u.jobTitle && (
                  <p className="text-xs text-slate-700 flex items-center gap-1.5 mt-1 font-medium truncate" title={u.jobTitle}>
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{u.jobTitle}</span>
                  </p>
                )}

                <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1 font-medium">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{dept?.name || u.departmentName || "Unassigned"}</span>
                </p>

                {/* Additional user attributes */}
                <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 truncate" title={u.phone || "No phone"}>
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate font-mono">{u.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1 truncate" title={u.telegramUsername ? `@${u.telegramUsername}` : u.telegramChatId ? `ID: ${u.telegramChatId}` : "No Telegram"}>
                    <Send className="w-3 h-3 text-sky-500 shrink-0" />
                    <span className="truncate font-medium text-sky-700">
                      {u.telegramUsername ? `@${u.telegramUsername.replace("@", "")}` : u.telegramChatId ? `ID: ${u.telegramChatId}` : "Not linked"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2 text-slate-400 text-[10px]">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card footer: Quick actions */}
            <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-slate-100">
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
                      ? "text-amber-600 hover:text-amber-700"
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
          </div>
        );
      })}
    </div>
  );
}
