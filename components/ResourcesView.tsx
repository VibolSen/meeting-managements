"use client";

import React, { useState } from "react";
import { Building, Package, UserCheck } from "lucide-react";
import { User } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { RoomManagementView } from "@/components/RoomManagementView";
import { EquipmentInventoryView } from "@/components/EquipmentInventoryView";
import { StaffRosterView } from "@/components/StaffRosterView";

export type ResourceTab = "rooms" | "materials" | "staff";

interface ResourcesViewProps {
  currentUser?: User | null;
  initialTab?: ResourceTab;
}

export function ResourcesView({
  currentUser = null,
  initialTab = "rooms",
}: ResourcesViewProps = {}) {
  const { user: authUser } = useAuth();
  const effectiveUser = currentUser || authUser;
  const [activeTab, setActiveTab] = useState<ResourceTab>(initialTab);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Unified Tab Switcher for portals that bundle resources */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-xs max-w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("rooms")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "rooms"
              ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Building className="w-4 h-4 text-indigo-600" />
          <span>Rooms</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("materials")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "materials"
              ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Package className="w-4 h-4 text-indigo-600" />
          <span>Equipment & Inventory</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("staff")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "staff"
              ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <UserCheck className="w-4 h-4 text-indigo-600" />
          <span>Staff Roster</span>
        </button>
      </div>

      {/* Render the selected dedicated management view */}
      {activeTab === "rooms" && <RoomManagementView currentUser={effectiveUser} />}
      {activeTab === "materials" && <EquipmentInventoryView currentUser={effectiveUser} />}
      {activeTab === "staff" && <StaffRosterView currentUser={effectiveUser} />}
    </div>
  );
}
