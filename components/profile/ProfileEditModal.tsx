"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Department, api } from "@/lib/api";
import { UserAvatar } from "@/components/users/UserAvatar";
import { User as UserIcon, Mail, Building, Image as ImageIcon, Save, X } from "lucide-react";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  departments: Department[];
  onUserUpdated: (updatedUser: User) => void;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  user,
  departments,
  onUserUpdated,
}: ProfileEditModalProps) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [departmentId, setDepartmentId] = useState<number | undefined>(user.departmentId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(user.name || "");
      setEmail(user.email || "");
      setAvatarUrl(user.avatarUrl || "");
      setDepartmentId(user.departmentId);
      setError(null);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        name: name.trim(),
        email: email.trim(),
        role: user.role,
        status: user.status || "ACTIVE",
        avatarUrl: avatarUrl.trim() || undefined,
        departmentId: departmentId ? Number(departmentId) : undefined,
      };

      const updated = await api.users.update(user.userId, payload);
      onUserUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <UserIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Edit Profile</h3>
            <p className="text-xs text-slate-400">Update your personal account information</p>
          </div>
        </div>
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Live Avatar Preview */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
          <UserAvatar
            name={name || "User"}
            avatarUrl={avatarUrl || null}
            size="lg"
            className="w-14 h-14 rounded-2xl shadow-xs shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800">Avatar Preview</p>
            <p className="text-[11px] text-slate-400">
              Provide an image URL below or your initials will be styled dynamically.
            </p>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
            className="text-xs"
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@organization.com"
            required
            className="text-xs"
          />
        </div>

        {/* Avatar URL */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Avatar Image URL (Optional)
          </label>
          <Input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="text-xs"
          />
        </div>

        {/* Department */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
          <select
            value={departmentId || ""}
            onChange={(e) =>
              setDepartmentId(e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
          >
            <option value="">Unassigned</option>
            {departments.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Modal Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs"
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
