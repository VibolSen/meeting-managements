"use client";

import React, { useState } from "react";
import Header from "@/components/headers/Header";
import AdminSidebar from "@/components/sidebars/AdminSidebar";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { useAuth } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0b0f19] overflow-hidden font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      {/* Sidebar with responsive mobile drawer support */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          portalRole="ADMIN"
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-5 bg-slate-50/50 dark:bg-[#0b0f19]">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        userId={user?.userId || 0}
      />
    </div>
  );
}
