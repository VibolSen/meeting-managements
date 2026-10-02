"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import { Navigation, NavTab } from "@/components/headers/Navigation";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { DashboardView } from "@/components/DashboardView";
import { BookingWizard } from "@/components/BookingWizard";
import { MeetingsListView } from "@/components/MeetingsListView";
import { RoomScheduleView } from "@/components/RoomScheduleView";
import { api, User } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function OrganizerDashboard() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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
            const orgUser = usersList.find((u) => u.role === "ORGANIZER") || usersList[0];
            setCurrentUser(orgUser);
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
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-800">
      {/* Top Navbar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        users={users}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* Dynamic API Status Indicator if no users loaded */}
      {users.length === 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-900 flex items-center justify-center gap-2">
          <span>Connecting to Backend API (<code>http://localhost:8080/api</code>)... Please verify your Spring Boot backend service is running.</span>
        </div>
      )}

      {/* Organizer Subheader Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Organizer Workspace</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Role: ORGANIZER
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Schedule new conferences, check room real-time availability, and coordinate equipment/staff.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Main Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "dashboard" && (
          <DashboardView
            currentUser={currentUser}
            onNavigate={(tab) => setActiveTab(tab as NavTab)}
          />
        )}

        {activeTab === "booking" && (
          <BookingWizard
            currentUser={currentUser}
            onSuccess={() => setActiveTab("meetings")}
            onCancel={() => setActiveTab("dashboard")}
          />
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
      </main>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        userId={currentUser?.userId || 0}
      />
    </div>
  );
}
