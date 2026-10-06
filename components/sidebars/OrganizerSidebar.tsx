"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarPlus,
  Briefcase,
  MailCheck,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { api, SystemInfo } from "@/lib/api";

export type OrganizerTab =
  | "dashboard"
  | "my-meetings"
  | "book-meeting"
  | "room-schedule"
  | "my-invitations"
  | "notifications"
  | "profile";

export interface OrganizerSidebarProps {
  activeTab?: OrganizerTab;
  onTabChange?: (tab: OrganizerTab) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function OrganizerSidebar({
  activeTab = "dashboard",
  onTabChange,
  mobileOpen = false,
  onMobileClose,
}: OrganizerSidebarProps = {}) {
  const [collapsed, setCollapsed] = useState(false);
  const [appName, setAppName] = useState("MeetingHub MMS");
  const [orgName, setOrgName] = useState("Enterprise Hub");
  const [logoUrl, setLogoUrl] = useState("/default logo/meeting-time.svg");
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loadingSystem, setLoadingSystem] = useState(true);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  useEffect(() => {
    let isMounted = true;
    const fetchBrandingAndInfo = async () => {
      try {
        const [info, settings] = await Promise.all([
          api.system.getInfo().catch(() => null),
          api.systemSettings.getPublic().catch(() => []),
        ]);
        if (!isMounted) return;
        if (info) setSystemInfo(info);
        if (Array.isArray(settings)) {
          const app = settings.find((i) => i.settingKey === "branding.app_name");
          const org = settings.find((i) => i.settingKey === "branding.organization_name");
          const logo = settings.find((i) => i.settingKey === "branding.logo_url");
          if (app?.settingValue) setAppName(app.settingValue);
          if (org?.settingValue) setOrgName(org.settingValue);
          if (logo?.settingValue) setLogoUrl(logo.settingValue);
        }
      } finally {
        if (isMounted) setLoadingSystem(false);
      }
    };

    fetchBrandingAndInfo();
    const handleSettingsUpdated = () => fetchBrandingAndInfo();
    window.addEventListener("system-settings-updated", handleSettingsUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener("system-settings-updated", handleSettingsUpdated);
    };
  }, []);

  const navItems: {
    id: OrganizerTab;
    label: string;
    icon: React.ReactNode;
    href: string;
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard Overview",
      icon: <LayoutDashboard className="w-4.5 h-4.5" />,
      href: "/organizer/dashboard",
    },
    {
      id: "my-meetings",
      label: "My Organized Meetings",
      icon: <Briefcase className="w-4.5 h-4.5" />,
      href: "/organizer/my-meetings",
    },
    {
      id: "book-meeting",
      label: "Book New Meeting",
      icon: <CalendarPlus className="w-4.5 h-4.5" />,
      href: "/organizer/book-meeting",
    },
    {
      id: "room-schedule",
      label: "Room Schedule",
      icon: <CalendarDays className="w-4.5 h-4.5" />,
      href: "/organizer/room-schedule",
    },
    {
      id: "my-invitations",
      label: "My Invitations",
      icon: <MailCheck className="w-4.5 h-4.5" />,
      href: "/organizer/my-invitations",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4.5 h-4.5" />,
      href: "/organizer/notifications",
    }
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

      {/* Sidebar Aside */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-indigo-50/80 via-white to-slate-50 dark:from-[#0d121f] dark:via-[#0d121f] dark:to-[#0b0f19] border-r border-slate-200/80 dark:border-slate-800 flex flex-col shadow-xl select-none transition-all duration-300 ease-in-out lg:static lg:h-screen lg:z-30 lg:shadow-xs lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-16 lg:w-16" : "w-64 lg:w-64"}`}
      >
        {/* Top Branding Header */}
        <div
          className={`h-16 flex items-center border-b border-slate-200/80 dark:border-slate-800 shrink-0 relative ${
            collapsed ? "justify-center px-1" : "justify-between px-3.5"
          }`}
        >
          <Link
            href="/organizer/dashboard"
            onClick={onMobileClose}
            className={`flex items-center gap-2.5 overflow-hidden group ${
              collapsed ? "justify-center" : ""
            }`}
            title={`${appName} - Organizer Console`}
          >
            <div className="w-8.5 h-8.5 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src={logoUrl || "/default logo/meeting-time.svg"}
                alt={`${appName} Logo`}
                className="w-full h-full object-contain"
              />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-extrabold text-xs text-slate-900 block truncate">
                  {appName}
                </span>
                <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Organizer Console
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

        {/* Desktop Expand Floating Badge */}
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
              Organizer Menu
            </p>
          )}

          {navItems.map((item) => {
            const effectivePath = pendingPath || pathname;
            const isCurrentRoute =
              effectivePath === item.href ||
              (effectivePath ? effectivePath.startsWith(item.href + "/") : false) ||
              (item.id === "dashboard" &&
                (effectivePath === "/organizer" || effectivePath === "/organizer/dashboard"));
            const isActive = pendingPath
              ? pendingPath === item.href
              : onTabChange && activeTab
              ? activeTab === item.id
              : isCurrentRoute;

            return (
              <Link
                key={item.id}
                href={item.href}
                prefetch={true}
                onClick={() => {
                  setPendingPath(item.href);
                  if (onTabChange) {
                    onTabChange(item.id);
                  }
                  if (onMobileClose) {
                    onMobileClose();
                  }
                }}
                className={`flex items-center rounded-xl text-xs font-semibold transition-all duration-150 select-none cursor-pointer active:scale-[0.98] group ${
                  collapsed
                    ? "w-9.5 h-9.5 mx-auto justify-center"
                    : "w-full gap-2.5 px-3 py-2"
                } ${
                  isActive
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-bold shadow-indigo-200"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 active:bg-indigo-100"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span
                  className={`flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                    isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-600"
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

        {/* Dynamic System Version Footer (Clean Minimalist Display with pulse dot) */}
        {collapsed ? (
          <div className="mt-auto py-3 border-t border-slate-100/80 bg-slate-50/40 flex flex-col items-center justify-center gap-1">
            {loadingSystem ? (
              <div className="h-2 w-7 bg-slate-200/80 rounded animate-pulse" />
            ) : systemInfo?.version ? (
              <div
                className="flex flex-col items-center gap-1 cursor-default select-none group"
                title={`System Operational • Version ${
                  systemInfo.version.startsWith("v")
                    ? systemInfo.version
                    : `v${systemInfo.version}`
                }`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="font-mono text-[9px] font-semibold text-slate-500 bg-white border border-slate-200/80 px-1 py-0.5 rounded shadow-2xs">
                  {systemInfo.version.startsWith("v")
                    ? systemInfo.version
                    : `v${systemInfo.version}`}
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-auto px-4 py-3 border-t border-slate-100/90 dark:border-slate-800 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-[#0b0f19]/50">
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
                  {systemInfo.version.startsWith("v")
                    ? systemInfo.version
                    : `v${systemInfo.version}`}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </aside>
    </>
  );
}

export default OrganizerSidebar;
