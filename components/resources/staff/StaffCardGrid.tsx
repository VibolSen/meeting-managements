"use client";

import React from "react";
import {
  UserCheck,
  Eye,
  Edit2,
  Trash2,
  Inbox,
  CheckCircle2,
  Moon,
  Sparkles,
} from "lucide-react";
import { Staff } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StaffCardGridProps {
  staffList: Staff[];
  loading: boolean;
  isAdmin: boolean;
  actionLoading: boolean;
  selectedStaffIds: Set<number>;
  onToggleSelectStaff: (staffId: number) => void;
  onViewStaff: (staff: Staff) => void;
  onEditStaff: (staff: Staff) => void;
  onToggleStaffStatus: (staff: Staff) => void;
  onDeleteStaff: (staffId: number) => void;
}

export function StaffCardGrid({
  staffList,
  loading,
  isAdmin,
  actionLoading,
  selectedStaffIds,
  onToggleSelectStaff,
  onViewStaff,
  onEditStaff,
  onToggleStaffStatus,
  onDeleteStaff,
}: StaffCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-4"
          >
            <div className="h-5 bg-slate-200 rounded-md w-2/3"></div>
            <div className="h-4 bg-slate-100 rounded-md w-1/3"></div>
            <div className="h-10 bg-slate-100 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (staffList.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No staff members found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No personnel match your search or filter criteria. Try adjusting filters or enroll a new staff member.
        </p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {staffList.map((staff) => {
        const isSelected = selectedStaffIds.has(staff.staffId);

        return (
          <Card
            key={staff.staffId}
            className={`p-5 border-slate-200 bg-white flex flex-col justify-between hover:border-violet-300 transition-all group shadow-xs relative ${
              isSelected ? "ring-2 ring-violet-500/50 border-violet-300 bg-violet-50/10" : ""
            }`}
          >
            <div className="space-y-3">
              {/* Header: Checkbox + Avatar + Name + Role + Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  {isAdmin && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectStaff(staff.staffId)}
                      className="mt-1 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                    />
                  )}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    {getInitials(staff.name)}
                  </div>
                  <div>
                    <h4
                      onClick={() => onViewStaff(staff)}
                      className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors cursor-pointer"
                    >
                      {staff.name}
                    </h4>
                    <span className="inline-block mt-0.5 text-[10px] font-bold tracking-wider uppercase text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200">
                      {staff.role}
                    </span>
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

              {/* Skills Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Skills & Specialization</span>
                </div>
                <p className="text-slate-700 font-medium">
                  {staff.skill || "Standard operations & meeting logistics"}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
              {isAdmin ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleStaffStatus(staff)}
                  disabled={actionLoading}
                  leftIcon={
                    staff.availabilityStatus === "AVAILABLE" ? (
                      <Moon className="w-3 h-3 text-slate-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    )
                  }
                  className={`h-7 px-2 text-[11px] font-semibold rounded-lg ${
                    staff.availabilityStatus === "AVAILABLE"
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {staff.availabilityStatus === "AVAILABLE" ? "Off Duty" : "Available"}
                </Button>
              ) : (
                <span className="text-slate-400 text-[11px] font-mono">ID: #{staff.staffId}</span>
              )}

              <div className="inline-flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onViewStaff(staff)}
                  className="text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                  title="View Profile"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>

                {isAdmin && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEditStaff(staff)}
                      className="text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDeleteStaff(staff.staffId)}
                      disabled={actionLoading}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Remove Staff"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
