import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Department, UserRole, UserStatus, BookingAccessLevel } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Plus, Pencil, KeyRound, Copy, Check, Image as ImageIcon, CalendarCheck, Eye } from "lucide-react";
import { UserAvatar } from "./UserAvatar";

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  departmentId?: number;
  status?: UserStatus;
  bookingAccess?: BookingAccessLevel;
  avatarUrl?: string;
  jobTitle?: string;
  phone?: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  userForm: UserFormData;
  setUserForm: React.Dispatch<React.SetStateAction<UserFormData>>;
  departments: Department[];
  actionLoading: boolean;
  mode?: "create" | "edit";
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  userForm,
  setUserForm,
  departments,
  actionLoading,
  mode = "create",
}: UserFormModalProps) {
  const toast = useToast();
  const isEdit = mode === "edit";
  const [copied, setCopied] = useState(false);

  // Generate strong random password
  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `Mms@${pwd}`;
    setUserForm((prev) => ({ ...prev, password: generated }));
    toast.success("Generated secure password!");
  };

  // Copy credentials to clipboard
  const handleCopyCredentials = async () => {
    if (!userForm.email) {
      toast.error("Please fill in email before copying credentials.");
      return;
    }

    const text = [
      "--- Meeting Management Hub Credentials ---",
      `Full Name: ${userForm.name || "N/A"}`,
      `Email: ${userForm.email}`,
      `Temporary Password: ${userForm.password || "(Existing Password Preserved)"}`,
      `Role: ${userForm.role}`,
      `Status: ${userForm.status || "ACTIVE"}`,
      "------------------------------------------",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Login credentials copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Failed to copy credentials to clipboard.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit User Account" : "Add New User Account"}
    >
      <form onSubmit={onSubmit} className="space-y-3.5">
        {/* Name and Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
          <Input
            type="text"
            required
            placeholder="e.g. John Doe"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <Input
            type="email"
            required
            placeholder="e.g. john@meetinghub.com"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
          />
        </div>

        {/* 2-Column: Job Title and Phone Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Job Title / Designation (optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Senior Tech Lead"
              value={userForm.jobTitle || ""}
              onChange={(e) => setUserForm({ ...userForm, jobTitle: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone / Mobile (optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. +855 12 345 678"
              value={userForm.phone || ""}
              onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
            />
          </div>
        </div>

        {/* Avatar Image URL with Live Thumbnail Preview */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Avatar Image URL (optional)
          </label>
          <div className="flex items-center gap-2.5">
            <div className="shrink-0" title="Avatar Preview">
              <UserAvatar
                name={userForm.name || "Preview"}
                avatarUrl={userForm.avatarUrl}
                size="md"
              />
            </div>
            <div className="flex-1 relative">
              <Input
                type="url"
                placeholder="https://images.unsplash.com/... or https://..."
                value={userForm.avatarUrl || ""}
                onChange={(e) => setUserForm({ ...userForm, avatarUrl: e.target.value })}
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Provide a direct public image link, or leave blank to automatically display stylized initials.
          </p>
        </div>

        {/* Password Field with Generator & Copy Actions */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700">
              {isEdit ? "New Password (optional)" : "Password"}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                title="Generate Random Secure Password"
              >
                <KeyRound className="w-3 h-3" />
                Generate
              </button>

              {userForm.password && (
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  title="Copy Login Details"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Info
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <Input
            type="text"
            required={!isEdit}
            placeholder={isEdit ? "Leave blank to keep current password" : "••••••••"}
            value={userForm.password || ""}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
          />
          {isEdit && (
            <p className="text-[11px] text-slate-400 mt-1">
              Only enter a value if you wish to reset or change this user's login password.
            </p>
          )}
        </div>

        {/* 3-Column: Role, Department, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
            <Select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
            >
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="ORGANIZER">ORGANIZER</option>
              <option value="ADMIN">ADMIN</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
            <Select
              value={userForm.departmentId ?? ""}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  departmentId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            >
              <option value="">None</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
            <Select
              value={userForm.status || "ACTIVE"}
              onChange={(e) =>
                setUserForm({ ...userForm, status: e.target.value as UserStatus })
              }
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </Select>
          </div>
        </div>

        {/* Booking Privilege / Access Level (Probation / Intern control) */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800">
              Booking Permission & Access Level
            </label>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                userForm.bookingAccess === "VIEW_ONLY"
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-indigo-100 text-indigo-800 border border-indigo-200"
              }`}
            >
              {userForm.bookingAccess === "VIEW_ONLY" ? "Probation / Restricted" : "Standard Privileges"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setUserForm({ ...userForm, bookingAccess: "FULL_ACCESS" })}
              className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                (userForm.bookingAccess || "FULL_ACCESS") === "FULL_ACCESS"
                  ? "bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                  : "bg-white/60 border-slate-200 hover:border-slate-300 text-slate-600"
              }`}
            >
              <CalendarCheck className={`w-4 h-4 mt-0.5 shrink-0 ${
                (userForm.bookingAccess || "FULL_ACCESS") === "FULL_ACCESS" ? "text-indigo-600" : "text-slate-400"
              }`} />
              <div>
                <p className="text-xs font-bold text-slate-800">Full Access (Can Book)</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Full rights to reserve rooms, invite colleagues & request equipment.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUserForm({ ...userForm, bookingAccess: "VIEW_ONLY" })}
              className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                userForm.bookingAccess === "VIEW_ONLY"
                  ? "bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                  : "bg-white/60 border-slate-200 hover:border-slate-300 text-slate-600"
              }`}
            >
              <Eye className={`w-4 h-4 mt-0.5 shrink-0 ${
                userForm.bookingAccess === "VIEW_ONLY" ? "text-amber-600" : "text-slate-400"
              }`} />
              <div>
                <p className="text-xs font-bold text-slate-800">View Only (Probation Staff)</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Restricted from booking. Staff can only view agendas & attend invites.
                </p>
              </div>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Use <strong>View Only</strong> for employees under probation or interns. Once probation is completed, simply switch back to <strong>Full Access</strong>.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={actionLoading}
            leftIcon={isEdit ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          >
            {isEdit ? "Save Changes" : "Create User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Backward compatibility alias
export const AddUserModal = UserFormModal;
