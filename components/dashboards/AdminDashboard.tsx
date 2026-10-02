"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardView } from "@/components/DashboardView";
import { ResourcesView } from "@/components/ResourcesView";
import { MeetingsListView } from "@/components/MeetingsListView";
import { RoomScheduleView } from "@/components/RoomScheduleView";
import { BookingWizard } from "@/components/BookingWizard";
import { api, User } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { NavTab } from "@/components/headers/Navigation";

export function AdminDashboard() {
  const { user: authUser } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as NavTab | null;
  const [activeTab, setActiveTab] = useState<NavTab>(tabParam || "dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [authUser]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersList = await api.users.getAll();
        if (usersList && usersList.length > 0) {
          setUsers(usersList);
          if (!authUser) {
            const adminUser = usersList.find((u) => u.role === "ADMIN") || usersList[0];
            setCurrentUser(adminUser);
          }
        } else {
          setUsers([]);
          if (!authUser) setCurrentUser(null);
        }
      } catch {
        setUsers([]);
        if (!authUser) setCurrentUser(null);
      }
    };

    loadUsers();
  }, [authUser]);

  return (
    <div className="w-full space-y-4">
      {/* Dynamic API Status Indicator if no users loaded */}
      {users.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2 text-center text-xs text-amber-900 flex items-center justify-center gap-2 shadow-xs">
          <span>
            Connecting to Backend API (<code>http://localhost:8080/api</code>)... Please verify your Spring Boot backend service is running.
          </span>
        </div>
      )}

      {/* Main View Area */}
      <div>
        {activeTab === "dashboard" && (
          <DashboardView
            currentUser={currentUser}
            onNavigate={(tab) => setActiveTab(tab as NavTab)}
          />
        )}

        {activeTab === "resources" && (
          <ResourcesView currentUser={currentUser} />
        )}

        {activeTab === "meetings" && (
          <MeetingsListView
            currentUser={currentUser}
            onNavigateToBooking={() => setActiveTab("booking")}
          />
        )}

        {activeTab === "calendar" && (
          <RoomScheduleView
            currentUser={currentUser}
            onBookSlot={() => setActiveTab("booking")}
          />
        )}

        {activeTab === "booking" && (
          <BookingWizard
            currentUser={currentUser}
            onSuccess={() => setActiveTab("meetings")}
            onCancel={() => setActiveTab("dashboard")}
          />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
