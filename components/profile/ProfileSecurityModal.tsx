"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, api } from "@/lib/api";
import { KeyRound, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

interface ProfileSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function ProfileSecurityModal({
  isOpen,
  onClose,
  user,
}: ProfileSecurityModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await api.users.update(user.userId, {
        name: user.name,
        email: user.email,
        role: user.role,
        password: newPassword,
        status: user.status || "ACTIVE",
        departmentId: user.departmentId,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to update password. Please try again.");
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
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Security Credentials</h3>
            <p className="text-xs text-slate-400">Update your account password & access key</p>
          </div>
        </div>
      }
      maxWidth="md"
    >
      {success ? (
        <div className="py-8 text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">Password Updated Successfully</h4>
          <p className="text-xs text-slate-400">
            Your new security credentials have been saved.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              New Password
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              className="text-xs"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">Security Checklist:</p>
            <p>• Minimum 6 characters required</p>
            <p>• Avoid using predictable personal names</p>
            <p>• Role privileges remain tied to #{user.userId}</p>
          </div>

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
            >
              {submitting ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
