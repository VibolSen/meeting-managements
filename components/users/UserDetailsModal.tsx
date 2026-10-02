import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { User, Department, Meeting, api } from "@/lib/api";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserAvatar } from "./UserAvatar";
import {
  Mail,
  Building,
  Shield,
  User as UserIcon,
  Edit3,
  Calendar,
  Clock,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  isAdmin: boolean;
  onEdit?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
}

export function UserDetailsModal({
  user,
  isOpen,
  onClose,
  departments,
  isAdmin,
  onEdit,
  onToggleStatus,
}: UserDetailsModalProps) {
  const [userMeetings, setUserMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  useEffect(() => {
    if (isOpen && user?.userId) {
      setLoadingMeetings(true);
      api.meetings
        .getByOrganizer(user.userId)
        .then((data) => setUserMeetings(data || []))
        .catch(() => setUserMeetings([]))
        .finally(() => setLoadingMeetings(false));
    } else {
      setUserMeetings([]);
    }
  }, [isOpen, user?.userId]);

  if (!user) return null;

  const dept = departments.find((d) => d.departmentId === user.departmentId);
  const departmentName = dept?.name || user.departmentName || "Unassigned";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile Details">
      <div className="space-y-4">
        {/* Header Profile Card with Avatar */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <UserAvatar
            name={user.name}
            avatarUrl={user.avatarUrl}
            status={user.status}
            size="lg"
            showStatusIndicator
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-base truncate">{user.name}</h3>
              <UserRoleBadge role={user.role} />
              <UserStatusBadge status={user.status} />
            </div>
            <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {user.email}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
              User ID
            </span>
            <p className="font-bold text-slate-800">#{user.userId}</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              Access Level
            </span>
            <p className="font-bold text-slate-800">{user.role}</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-500" />
              Assigned Department
            </span>
            <p className="font-bold text-slate-800 truncate">{departmentName}</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              {user.status === "SUSPENDED" ? (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              )}
              Account Status
            </span>
            <p
              className={`font-bold capitalize ${
                user.status === "SUSPENDED" ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {user.status || "ACTIVE"}
            </p>
          </div>
        </div>

        {/* Meeting Activity Section */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Organized Meetings
            </span>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              {loadingMeetings ? "..." : `${userMeetings.length} Meetings`}
            </span>
          </div>

          {loadingMeetings ? (
            <p className="text-[11px] text-slate-400 py-1">Loading meeting history...</p>
          ) : userMeetings.length === 0 ? (
            <p className="text-[11px] text-slate-400 py-1">No organized meetings on record.</p>
          ) : (
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {userMeetings.slice(0, 4).map((m) => (
                <div
                  key={m.meetingId}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60 text-[11px]"
                >
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                    {m.title}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(m.startTime).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-1.5 flex justify-end">
            <Link
              href="/portal"
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <span>Schedule New Meeting in Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <div>
            {isAdmin && onToggleStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onToggleStatus(user);
                  onClose();
                }}
                className={
                  user.status === "SUSPENDED"
                    ? "text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                    : "text-rose-700 hover:bg-rose-50 border-rose-200"
                }
              >
                {user.status === "SUSPENDED" ? "Activate Account" : "Suspend Account"}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {isAdmin && onEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit User
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
