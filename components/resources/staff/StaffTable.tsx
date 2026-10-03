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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StaffTableProps {
  staffList: Staff[];
  loading: boolean;
  isAdmin: boolean;
  actionLoading: boolean;
  selectedStaffIds: Set<number>;
  onToggleSelectStaff: (staffId: number) => void;
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
  onViewStaff: (staff: Staff) => void;
  onEditStaff: (staff: Staff) => void;
  onToggleStaffStatus: (staff: Staff) => void;
  onDeleteStaff: (staffId: number) => void;
}

export function StaffTable({
  staffList,
  loading,
  isAdmin,
  actionLoading,
  selectedStaffIds,
  onToggleSelectStaff,
  onToggleSelectAll,
  isAllSelected,
  onViewStaff,
  onEditStaff,
  onToggleStaffStatus,
  onDeleteStaff,
}: StaffTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-8 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          <p className="text-xs text-slate-500 font-medium">Loading staff roster...</p>
        </div>
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

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
            <tr>
              {isAdmin && (
                <th className="p-3.5 pl-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                    title="Select All Staff on Current Page"
                  />
                </th>
              )}
              <th className="p-3.5 font-bold text-slate-700">Personnel & ID</th>
              <th className="p-3.5 font-bold text-slate-700">Assigned Role</th>
              <th className="p-3.5 font-bold text-slate-700">Specialization & Skills</th>
              <th className="p-3.5 font-bold text-slate-700">Availability</th>
              <th className="p-3.5 pr-4 text-right font-bold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.map((staff) => {
              const isSelected = selectedStaffIds.has(staff.staffId);

              return (
                <tr
                  key={staff.staffId}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isSelected ? "bg-violet-50/40" : ""
                  }`}
                >
                  {isAdmin && (
                    <td className="p-3.5 pl-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectStaff(staff.staffId)}
                        className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                      />
                    </td>
                  )}

                  {/* Name & Avatar */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                        {getInitials(staff.name)}
                      </div>
                      <div>
                        <button
                          onClick={() => onViewStaff(staff)}
                          className="font-bold text-slate-900 hover:text-violet-600 transition-colors cursor-pointer text-left"
                        >
                          {staff.name}
                        </button>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: #{staff.staffId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="p-3.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide uppercase bg-violet-50 text-violet-700 border border-violet-200">
                      {staff.role}
                    </span>
                  </td>

                  {/* Skills */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 text-slate-700 max-w-xs truncate font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{staff.skill || "Standard operations"}</span>
                    </div>
                  </td>

                  {/* Availability Badge */}
                  <td className="p-3.5">
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
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 pr-4 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      {/* View Details */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onViewStaff(staff)}
                        className="text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                        title="View Staff Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      {isAdmin && (
                        <>
                          {/* Quick Availability Toggle */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onToggleStaffStatus(staff)}
                            disabled={actionLoading}
                            className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            title={
                              staff.availabilityStatus === "AVAILABLE"
                                ? "Mark Off Duty"
                                : "Mark Available"
                            }
                          >
                            {staff.availabilityStatus === "AVAILABLE" ? (
                              <Moon className="w-3.5 h-3.5 text-slate-500" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </Button>

                          {/* Edit Staff */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onEditStaff(staff)}
                            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="Edit Staff Member"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          {/* Delete Staff */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDeleteStaff(staff.staffId)}
                            disabled={actionLoading}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Remove Staff Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
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
