"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Home, 
  ExternalLink, 
  LogOut,
  ChevronDown,
  Mail,
  Menu,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

interface HeaderProps {
  title?: string;
  onOpenNotifications?: () => void;
  onOpenMobileSidebar?: () => void;
}

export function Header({
  onOpenNotifications,
  onOpenMobileSidebar,
}: HeaderProps = {}) {
  const { user, logout, loading: authLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    if (user?.userId) {
      api.notifications
        .getByUser(user.userId)
        .then((items) => {
          if (isMounted && Array.isArray(items)) {
            setUnreadCount(items.length);
          }
        })
        .catch(() => {
          if (isMounted) setUnreadCount(0);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [user?.userId]);

  const handleSignOut = () => {
    setDropdownOpen(false);
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-xs shrink-0">
      {/* Left: Mobile Drawer Trigger (Hidden on Desktop) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
          aria-label="Open navigation menu"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Notifications & Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
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
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 transition-colors shadow-xs cursor-pointer select-none"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                {user?.name || (authLoading ? "Loading..." : "User")}
              </p>
              <p className="text-[10px] font-semibold text-indigo-600 leading-none">
                {user?.role || "ADMIN"}
              </p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200/90 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* Profile Details Header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-extrabold text-slate-900 truncate">
                  {user?.name || "System User"}
                </p>
                <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 shrink-0" />
                  {user?.email || "No email available"}
                </p>
                <div className="mt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Role: {user?.role || "ADMIN"}
                  </span>
                </div>
              </div>

              {/* Quick Navigation Links */}
              <div className="py-1">
                <Link
                  href="/"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <Home className="w-4 h-4 text-slate-400" />
                  Return to Launchpad
                </Link>

                <Link
                  href="/portal"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  General Portal
                </Link>
              </div>

              {/* Sign Out Action */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
