"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navigation, NavTab } from "@/components/headers/Navigation";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { DashboardView } from "@/components/DashboardView";
import { BookingWizard } from "@/components/BookingWizard";
import { RoomScheduleView } from "@/components/RoomScheduleView";
import { MeetingsListView } from "@/components/MeetingsListView";
import { ResourcesView } from "@/components/ResourcesView";
import { api, User } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface MeetingPortalProps {
  initialTab?: NavTab;
}

export function MeetingPortal({ initialTab = "dashboard" }: MeetingPortalProps) {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>(initialTab);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Booking Preset for pre-filled booking from calendar slot or quick actions
  const [bookingPreset, setBookingPreset] = useState<{
    roomId?: number;
    date?: string;
    startTime?: string;
    endTime?: string;
  }>({});

  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [authUser]);

  // Load Users from Backend API
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

  // Handlers for cross-component workflows
  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookSlot = (
    roomId: number,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    setBookingPreset({ roomId, date, startTime, endTime });
    setActiveTab("booking");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookingSuccess = () => {
    setBookingPreset({});
    setActiveTab("meetings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookingCancel = () => {
    setBookingPreset({});
    setActiveTab("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-800">
      {/* Top Navbar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={handleNavigate}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        users={users}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* Return to Launch Page Banner */}
      <div className="bg-slate-100/80 border-b border-slate-200/70 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Launch Gateway</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="text-slate-500 hover:text-slate-800 font-medium"
            >
              Admin Console
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/organizer/dashboard"
              className="text-slate-500 hover:text-slate-800 font-medium"
            >
              Organizer Workspace
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic API Status Indicator if no users loaded from backend */}
      {users.length === 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-900 flex items-center justify-center gap-2">
          <span>Connecting to Backend API (<code>http://localhost:8080/api</code>)... Please verify your Spring Boot backend service is running.</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "dashboard" && (
          <DashboardView
            currentUser={currentUser}
            onNavigate={(tab) => handleNavigate(tab as NavTab)}
          />
        )}

        {activeTab === "booking" && (
          <BookingWizard
            currentUser={currentUser}
            onSuccess={handleBookingSuccess}
            onCancel={handleBookingCancel}
            initialRoomId={bookingPreset.roomId}
            initialDate={bookingPreset.date}
            initialStartTime={bookingPreset.startTime}
            initialEndTime={bookingPreset.endTime}
          />
        )}

        {activeTab === "calendar" && (
          <RoomScheduleView
            currentUser={currentUser}
            onBookSlot={handleBookSlot}
            onNavigateToMeetings={() => handleNavigate("meetings")}
          />
        )}

        {activeTab === "meetings" && (
          <MeetingsListView
            currentUser={currentUser}
            onNavigateToBooking={() => handleNavigate("booking")}
          />
        )}

        {activeTab === "resources" && (
          <ResourcesView currentUser={currentUser} />
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
