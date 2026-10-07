"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Bell, 
  LogOut,
  ChevronDown,
  Mail,
  Menu,
  User as UserIcon,
  Settings,
  Clock,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api, UserRole, getStoredToken } from "@/lib/api";
import { UserAvatar } from "@/components/users/UserAvatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTour } from "@/components/tour/TourContext";

interface HeaderProps {
  title?: string;
  portalRole?: UserRole;
  onOpenNotifications?: () => void;
  onOpenMobileSidebar?: () => void;
}

export function Header({
  title,
  portalRole,
  onOpenNotifications,
  onOpenMobileSidebar,
}: HeaderProps = {}) {
  const { user, logout, loading: authLoading } = useAuth();
  const { openGuidelines } = useTour();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Determine effective workspace role from prop or route
  const effectiveRole: UserRole =
    portalRole ||
    (pathname?.startsWith("/organizer")
      ? "ORGANIZER"
      : pathname?.startsWith("/employee")
      ? "EMPLOYEE"
      : "ADMIN");

  // Route guard: If user is not authenticated and has no token, redirect to /login
  useEffect(() => {
    const token = getStoredToken();
    if (!authLoading && !user && !token) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const [appName, setAppName] = useState("Enterprise MMS");
  const [orgName, setOrgName] = useState("Enterprise Workspace");

  // Real-time Live Clock & Date
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load dynamic branding from backend
  useEffect(() => {
    let isMounted = true;
    const fetchBranding = () => {
      api.systemSettings
        .getPublic()
        .then((items) => {
          if (!isMounted || !Array.isArray(items)) return;
          const app = items.find((i) => i.settingKey === "branding.app_name");
          const org = items.find((i) => i.settingKey === "branding.organization_name");
          if (app?.settingValue) setAppName(app.settingValue);
          if (org?.settingValue) setOrgName(org.settingValue);
        })
        .catch(() => {});
    };

    fetchBranding();
    const handleSettingsUpdated = () => fetchBranding();
    window.addEventListener("system-settings-updated", handleSettingsUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener("system-settings-updated", handleSettingsUpdated);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Real-time unread notification count
  useEffect(() => {
    let isMounted = true;

    const fetchUnread = () => {
      if (user?.userId) {
        api.notifications
          .getByUser(user.userId)
          .then((items) => {
            if (isMounted && Array.isArray(items)) {
              const unread = items.filter((n) => n.status !== "READ").length;
              setUnreadCount(unread);
            }
          })
          .catch(() => {
            if (isMounted) setUnreadCount(0);
          });
      }
    };

    fetchUnread();

    const handleReadEvent = () => {
      fetchUnread();
    };

    window.addEventListener("notification-read", handleReadEvent);
    return () => {
      isMounted = false;
      window.removeEventListener("notification-read", handleReadEvent);
    };
  }, [user?.userId]);

  const handleSignOut = () => {
    setDropdownOpen(false);
    logout();
    window.location.href = "/login?logout=true";
  };

  // Profile display name fallback according to active workspace role
  const displayName =
    user?.name ||
    (effectiveRole === "ORGANIZER"
      ? "Meeting Organizer"
      : effectiveRole === "EMPLOYEE"
      ? "Alice Johnson"
      : "Vibol SEN");

  const displayEmail =
    user?.email ||
    (effectiveRole === "ORGANIZER"
      ? "organizer@meeting.com"
      : effectiveRole === "EMPLOYEE"
      ? "alice@meeting.com"
      : "vibolsen2002@gmail.com");

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-xs shrink-0 select-none relative">
      {/* Left: Mobile Drawer Trigger + Desktop Workspace Indicator */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-xs cursor-pointer"
          aria-label="Open navigation menu"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title ? (
          <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight hidden sm:block" data-tour="workspace-role">
            {title}
          </h1>
        ) : (
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400" data-tour="workspace-role">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-800 dark:text-slate-100 font-bold">
              {effectiveRole === "ADMIN"
                ? "Admin Console"
                : effectiveRole === "ORGANIZER"
                ? "Organizer Workspace"
                : "Employee Portal"}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{appName}</span>
          </div>
        )}
      </div>

      {/* Right: Telemetry Clock, Theme Toggle, Notifications & Dynamic Profile Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Real-time Digital Clock & Date Telemetry */}
        {currentTime && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 text-xs text-slate-700 dark:text-slate-300 shadow-2xs font-mono" data-tour="telemetry-clock">
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold tracking-tight text-slate-900 dark:text-white">{currentTime}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans font-medium">{currentDate}</span>
          </div>
        )}

        {/* Dark/Light Theme Toggle */}
        <div data-tour="theme-toggle">
          <ThemeToggle />
        </div>

        {/* Help & Guided Tour Trigger */}
        <button
          type="button"
          onClick={() => openGuidelines()}
          data-tour="help-tour"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-xs cursor-pointer"
          title="Help, Guidelines & Interactive Tour"
          aria-label="Help, Guidelines & Interactive Tour"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Notifications Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          data-tour="notifications-bell"
          className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-xs cursor-pointer"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md shadow-rose-500/40">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef} data-tour="user-profile">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs hover:shadow-sm cursor-pointer select-none group"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label="User profile and settings"
          >
            {/* Real Dynamic User Avatar with status dot */}
            <UserAvatar
              name={displayName}
              avatarUrl={user?.avatarUrl}
              size="sm"
              showStatusIndicator={true}
              status={user?.status || "ACTIVE"}
            />

            {/* User Name & Role Badge (Visible on all desktop and tablet viewports) */}
            <div className="hidden xs:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[130px] sm:max-w-[170px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {authLoading ? "Loading..." : displayName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider border ${
                    effectiveRole === "ADMIN"
                      ? "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800"
                      : effectiveRole === "ORGANIZER"
                      ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800"
                      : "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/70 border-violet-200 dark:border-violet-800"
                  }`}
                >
                  {user?.role || effectiveRole}
                </span>
                {user?.departmentName && (
                  <span className="hidden md:inline text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[100px]">
                    • {user.departmentName}
                  </span>
                )}
              </div>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* Profile Details Header Card */}
              <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <UserAvatar
                  name={displayName}
                  avatarUrl={user?.avatarUrl}
                  size="md"
                  showStatusIndicator={true}
                  status={user?.status || "ACTIVE"}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 shrink-0" />
                    {displayEmail}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                        effectiveRole === "ADMIN"
                          ? "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800"
                          : effectiveRole === "ORGANIZER"
                          ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800"
                          : "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/70 border-violet-200 dark:border-violet-800"
                      }`}
                    >
                      Role: {user?.role || effectiveRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Profile Actions */}
              <div className="py-1 space-y-0.5">
                <Link
                  href={
                    effectiveRole === "ORGANIZER"
                      ? "/organizer/profile"
                      : effectiveRole === "EMPLOYEE"
                      ? "/employee/profile"
                      : "/admin/profile"
                  }
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>My Profile & Account</span>
                </Link>

                <Link
                  href={
                    effectiveRole === "ORGANIZER"
                      ? "/organizer/settings"
                      : effectiveRole === "EMPLOYEE"
                      ? "/employee/settings"
                      : "/admin/settings"
                  }
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0 transition-colors" />
                  <span>Settings</span>
                </Link>
              </div>

              {/* Sign Out Action */}
              <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Glowing Bottom Gradient Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-indigo-500/40 dark:via-indigo-400/30 to-transparent pointer-events-none" />
    </header>
  );
}

export default Header;

