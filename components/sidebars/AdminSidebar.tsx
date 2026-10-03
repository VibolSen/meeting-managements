"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  Building,
  Building2,
  Package,
  Users,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { api, SystemInfo } from "@/lib/api";

export type AdminTab =
  | "dashboard"
  | "meetings"
  | "calendar"
  | "resources"
  | "rooms"
  | "equipment"
  | "staff"
  | "users"
  | "departments"
  | "booking";

export interface AdminSidebarProps {
  activeTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({
  activeTab = "dashboard",
  onTabChange,
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps = {}) {
  const [collapsed, setCollapsed] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loadingSystem, setLoadingSystem] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    const fetchSystemInfo = async () => {
      try {
        const info = await api.system.getInfo();
        if (isMounted) {
          setSystemInfo(info);
          setLoadingSystem(false);
        }
      } catch {
        if (isMounted) {
          setSystemInfo(null);
          setLoadingSystem(false);
        }
      }
    };
    fetchSystemInfo();
    return () => {
      isMounted = false;
    };
  }, []);

  // All 8 Core Management Routes (Compact 18px icons)
  const navItems: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    href: string;
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard Overview",
      icon: <LayoutDashboard className="w-4.5 h-4.5" />,
      href: "/admin/dashboard",
    },
    {
      id: "meetings",
      label: "Meetings & Approvals",
      icon: <Briefcase className="w-4.5 h-4.5" />,
      href: "/admin/meetings-approvals",
    },
    {
      id: "calendar",
      label: "Master Timeline",
      icon: <CalendarDays className="w-4.5 h-4.5" />,
      href: "/admin/master-timeline",
    },
    {
      id: "rooms",
      label: "Room Management",
      icon: <Building className="w-4.5 h-4.5" />,
      href: "/admin/room-management",
    },
    {
      id: "equipment",
      label: "Equipment & Inventory",
      icon: <Package className="w-4.5 h-4.5" />,
      href: "/admin/equipment-inventory",
    },
    {
      id: "staff",
      label: "Staff Roster",
      icon: <UserCheck className="w-4.5 h-4.5" />,
      href: "/admin/staff-roster",
    },
    {
      id: "users",
      label: "User Management",
      icon: <Users className="w-4.5 h-4.5" />,
      href: "/admin/user-management",
    },
    {
      id: "departments",
      label: "Department Management",
      icon: <Building2 className="w-4.5 h-4.5" />,
      href: "/admin/department-management",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside (Compact w-16 collapsed, w-64 expanded with Welcome Banner gradient fill) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-indigo-50/80 via-white to-slate-50 border-r border-slate-200/80 flex flex-col shadow-xl select-none transition-all duration-300 ease-in-out lg:static lg:h-screen lg:z-30 lg:shadow-xs lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-16 lg:w-16" : "w-64 lg:w-64"}`}
      >
        {/* Top Branding Header */}
        <div
          className={`h-16 flex items-center border-b border-slate-200/80 shrink-0 relative ${
            collapsed ? "justify-center px-1" : "justify-between px-3.5"
          }`}
        >
          <Link
            href="/"
            onClick={onMobileClose}
            className={`flex items-center gap-2.5 overflow-hidden group ${
              collapsed ? "justify-center" : ""
            }`}
            title="MeetingHub MMS"
          >
            <div className="w-8.5 h-8.5 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/default logo/meeting-time.svg"
                alt="Meeting Management System Logo"
                className="w-full h-full object-contain"
              />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-extrabold text-xs text-slate-900 block truncate">
                  MeetingHub MMS
                </span>
                <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close sidebar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Expand Floating Badge (Subtle compact 20px badge on border) */}
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="hidden lg:flex absolute -right-2.5 top-5.5 z-40 w-5 h-5 rounded-full bg-white border border-slate-200 shadow-xs hover:shadow-sm items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all cursor-pointer group"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Main Navigation Links */}
        <nav
          className={`py-3 space-y-1.5 flex-1 overflow-y-auto ${
            collapsed ? "px-1.5" : "px-3"
          }`}
        >
          {!collapsed && (
            <p className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Management Menu
            </p>
          )}

          {navItems.map((item) => {
            const isCurrentRoute =
              pathname === item.href ||
              (item.id === "dashboard" && (pathname === "/admin" || pathname === "/admin/dashboard"));
            const isActive = onTabChange ? activeTab === item.id : isCurrentRoute;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  if (onTabChange) {
                    onTabChange(item.id);
                  }
                  if (onMobileClose) {
                    onMobileClose();
                  }
                }}
                className={`flex items-center rounded-xl text-xs font-semibold transition-all select-none ${
                  collapsed
                    ? "w-9.5 h-9.5 mx-auto justify-center"
                    : "w-full gap-2.5 px-3 py-2"
                } ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span
                  className={`flex items-center justify-center shrink-0 ${
                    isActive ? "text-white" : "text-slate-500"
                  }`}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="truncate flex-1 text-left text-xs">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Dynamic System Version Footer (Polished SaaS Minimalist Display) */}
        {collapsed ? (
          <div className="mt-auto py-3 border-t border-slate-100/80 bg-slate-50/40 flex flex-col items-center justify-center gap-1">
            {loadingSystem ? (
              <div className="h-2 w-7 bg-slate-200/80 rounded animate-pulse" />
            ) : systemInfo?.version ? (
              <div
                className="flex flex-col items-center gap-1 cursor-default select-none group"
                title={`System Operational • Version ${systemInfo.version.startsWith("v") ? systemInfo.version : `v${systemInfo.version}`}`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="font-mono text-[9px] font-semibold text-slate-500 bg-white border border-slate-200/80 px-1 py-0.5 rounded shadow-2xs">
                  {systemInfo.version.startsWith("v") ? systemInfo.version : `v${systemInfo.version}`}
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-auto px-4 py-3 border-t border-slate-100/90 bg-linear-to-b from-transparent to-slate-50/50">
            {loadingSystem ? (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-3.5 w-20 bg-slate-200/70 rounded animate-pulse" />
              </div>
            ) : systemInfo?.version ? (
              <div className="flex items-center gap-2 select-none">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 tracking-tight">
                  Version
                </span>
                <span className="inline-flex items-center font-mono text-[10px] font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-md px-1.5 py-0.5 shadow-2xs">
                  {systemInfo.version.startsWith("v") ? systemInfo.version : `v${systemInfo.version}`}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </aside>
    </>
  );
}

export default AdminSidebar;
