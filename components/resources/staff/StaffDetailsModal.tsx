"use client";

import React from "react";
import {
  UserCheck,
  CheckCircle2,
  Moon,
  Sparkles,
  Edit2,
  Briefcase,
  Shield,
} from "lucide-react";
import { Staff } from "@/lib/api";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StaffDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  isAdmin: boolean;
  onEdit: (staff: Staff) => void;
  onToggleStatus: (staff: Staff) => void;
  actionLoading: boolean;
}

export function StaffDetailsModal({
  isOpen,
  onClose,
  staff,
  isAdmin,
  onEdit,
  onToggleStatus,
  actionLoading,
}: StaffDetailsModalProps) {
  if (!staff) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Support Staff Profile"
      description="Personnel qualifications, logistical assignments, and current operational status."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Header Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/70 via-slate-50 to-white dark:from-violet-950/40 dark:via-slate-900/80 dark:to-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              {getInitials(staff.name)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{staff.name}</h3>
              <div className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-semibold tracking-wider uppercase text-violet-700 bg-violet-100/70 px-2 py-0.5 rounded-md">
                <Briefcase className="w-3 h-3" />
                {staff.role}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                Staff ID: #{staff.staffId}
              </div>
            </div>
          </div>

          <Badge
            variant={
              staff.availabilityStatus === "AVAILABLE"
                ? "available"
                : staff.availabilityStatus === "ASSIGNED"
                ? "pending"
                : "neutral"
            }
          >
            {staff.availabilityStatus === "AVAILABLE"
              ? "Available"
              : staff.availabilityStatus === "ASSIGNED"
              ? "Assigned"
              : "Off Duty"}
          </Badge>
        </div>

        {/* Skills Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Skills & Specializations</span>
          </div>
          <p className="text-sm font-medium text-slate-800">
            {staff.skill || "Standard operations & meeting logistics support"}
          </p>
        </div>

        {/* Logistical Note */}
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Logistics Resource Designation</div>
            <div className="text-[11px] text-blue-800/90 mt-0.5">
              Staff members are scheduled to provide hands-on technical or hosting support for meetings. They do not hold software user accounts and are managed as event assets.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {isAdmin ? (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => onToggleStatus(staff)}
              disabled={actionLoading}
              leftIcon={
                staff.availabilityStatus === "AVAILABLE" ? (
                  <Moon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )
              }
              className={`text-xs ${
                staff.availabilityStatus === "AVAILABLE"
                  ? "text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              {staff.availabilityStatus === "AVAILABLE" ? "Mark Off Duty" : "Mark Available"}
            </Button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(staff);
                }}
                leftIcon={<Edit2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                className="text-xs text-slate-700 border-slate-200 hover:bg-slate-50"
              >
                Edit
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
