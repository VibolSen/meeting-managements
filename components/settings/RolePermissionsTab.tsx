"use client";

import React from "react";
import {
  Shield,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Package,
  UserCheck,
  CalendarPlus,
} from "lucide-react";
import { SystemSettingItem } from "@/lib/api";

interface RolePermissionsTabProps {
  systemSettings: Record<string, string>;
  onSettingChange: (key: string, value: string) => void;
}

export function RolePermissionsTab({
  systemSettings,
  onSettingChange,
}: RolePermissionsTabProps) {
  const getBool = (key: string, def = false) => {
    return systemSettings[key] === "true" || (systemSettings[key] === undefined && def);
  };

  const toggle = (key: string, def = false) => {
    const current = getBool(key, def);
    onSettingChange(key, current ? "false" : "true");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Admin Notice Header */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900">
              Role Access & Permission Governance
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-600 text-white">
              ADMIN CONTROL
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            Configure privileges dynamically from the UI. Changes apply immediately to backend API validations without touching code or redeploying services.
          </p>
        </div>
      </div>

      {/* Employee Role Permissions */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
              EMP
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Employee Role Permissions</h4>
              <p className="text-[11px] text-slate-500">
                Governance rules applied to standard corporate employees
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            EMPLOYEE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Can Book Meetings */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CalendarPlus className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <label className="text-xs font-bold text-slate-900 block cursor-pointer">
                    Allow Meeting Reservations
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    When enabled, employees can book meeting rooms directly from their workspace portal.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={getBool("role.employee.can_book", true)}
                onClick={() => toggle("role.employee.can_book", true)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  getBool("role.employee.can_book", true) ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    getBool("role.employee.can_book", true) ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              {getBool("role.employee.can_book", true) ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enabled (Employees can book)
                </span>
              ) : (
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Restricted (Admin/Organizer only)
                </span>
              )}
            </div>
          </div>

          {/* Require Approval */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <label className="text-xs font-bold text-slate-900 block cursor-pointer">
                    Mandatory Admin Approval
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    If active, all employee bookings start in PENDING state and require administrator sign-off.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={getBool("role.employee.require_approval", false)}
                onClick={() => toggle("role.employee.require_approval", false)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  getBool("role.employee.require_approval", false) ? "bg-amber-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    getBool("role.employee.require_approval", false) ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              {getBool("role.employee.require_approval", false) ? (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Approval Required for All Bookings
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Confirmed (Unless Boardroom)
                </span>
              )}
            </div>
          </div>

          {/* Cross Department Invitations */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <label className="text-xs font-bold text-slate-900 block cursor-pointer">
                    Cross-Department Invitations
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Allow employee bookers to invite attendees from other departments within the organization.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={getBool("role.employee.can_invite_external", true)}
                onClick={() => toggle("role.employee.can_invite_external", true)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  getBool("role.employee.can_invite_external", true) ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    getBool("role.employee.can_invite_external", true) ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              {getBool("role.employee.can_invite_external", true) ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Organization-wide Invitations
                </span>
              ) : (
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Same Department Only
                </span>
              )}
            </div>
          </div>

          {/* Request Materials */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Package className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <label className="text-xs font-bold text-slate-900 block cursor-pointer">
                    Equipment & Resource Requests
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Allow employees to request AV equipment, presentation clickers, and room supplies.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={getBool("role.employee.can_request_materials", true)}
                onClick={() => toggle("role.employee.can_request_materials", true)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  getBool("role.employee.can_request_materials", true) ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    getBool("role.employee.can_request_materials", true) ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              {getBool("role.employee.can_request_materials", true) ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Material Allocation Allowed
                </span>
              ) : (
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Room Only (No Material Requests)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Organizer Role Permissions */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs border border-purple-200">
              ORG
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Organizer Role Permissions</h4>
              <p className="text-[11px] text-slate-500">
                Governance rules applied to designated departmental organizers
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            ORGANIZER
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Organizer Require Approval */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <label className="text-xs font-bold text-slate-900 block cursor-pointer">
                    Mandatory Sign-off for Organizers
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Require administrator sign-off even for meetings scheduled by organizers.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={getBool("role.organizer.require_approval", false)}
                onClick={() => toggle("role.organizer.require_approval", false)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  getBool("role.organizer.require_approval", false) ? "bg-purple-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    getBool("role.organizer.require_approval", false) ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              {getBool("role.organizer.require_approval", false) ? (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Organizers Require Sign-off
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Instant Confirmation (Direct Approval)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
