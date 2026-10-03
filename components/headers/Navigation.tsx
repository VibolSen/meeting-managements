"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Briefcase,
  Layers,
  Bell,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { User, api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export type NavTab = "dashboard" | "booking" | "calendar" | "meetings" | "resources";

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: User | null;
  onUserChange: (user: User) => void;
  users: User[];
  onOpenNotifications: () => void;
}

export function Navigation({
  activeTab,
  onTabChange,
  currentUser,
  onUserChange,
  users,
  onOpenNotifications,
}: NavigationProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.userId) {
      api.notifications
        .getByUser(currentUser.userId)
        .then((items) => {
          setUnreadCount(items ? items.length : 0);
        })
        .catch(() => setUnreadCount(0));
    }
  }, [currentUser?.userId]);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "booking", label: "Book Meeting", icon: <PlusCircle className="w-4 h-4" /> },
    { id: "calendar", label: "Room Schedule", icon: <CalendarDays className="w-4 h-4" /> },
    { id: "meetings", label: "Meetings & Approvals", icon: <Briefcase className="w-4 h-4" /> },
    { id: "resources", label: "Resources & Admin", icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onTabChange("dashboard")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/default logo/meeting-time.svg"
                alt="Meeting Management System Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                MeetingHub <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">MMS</span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Smart Booking & Logistics
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-xl transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-white text-indigo-600 font-bold shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Notifications & User Switcher */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md shadow-rose-500/40">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Active User Switcher */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold border border-indigo-200">
                {currentUser?.name ? currentUser.name.charAt(0) : "U"}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser?.name || "Select User"}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  {currentUser?.role || "Role"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-900/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-800">Switch Active Account</p>
                    <p className="text-[11px] text-slate-500">Test different role permissions</p>
                  </div>
                  <div className="space-y-1">
                    {users.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-500">
                        <p className="font-semibold text-slate-700">No users found</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Connecting to API...
                        </p>
                      </div>
                    ) : (
                      users.map((u) => {
                        const isSelected = u.userId === currentUser?.userId;
                        return (
                          <button
                            key={u.userId}
                            onClick={() => {
                              onUserChange(u);
                              setUserDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <div>
                              <p className="font-semibold text-slate-900">{u.name}</p>
                              <p className="text-[10px] text-slate-500">{u.email}</p>
                            </div>
                            <Badge
                              variant={
                                u.role === "ADMIN"
                                  ? "confirmed"
                                  : u.role === "ORGANIZER"
                                  ? "pending"
                                  : "neutral"
                              }
                              withDot={false}
                            >
                              {u.role}
                            </Badge>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Auth Actions in Dropdown */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
                    <Link
                      href={currentUser?.role === "ORGANIZER" ? "/organizer/profile" : currentUser?.role === "ADMIN" ? "/admin/profile" : "/profile"}
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>My Profile & Roles</span>
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Switch / Sign In with Email</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        api.auth.logout();
                        setUserDropdownOpen(false);
                        window.location.href = "/login?logout=true";
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Sign Out (Clear Session)</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-xs"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl ${
                activeTab === item.id
                  ? "bg-indigo-50 text-indigo-600 font-bold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
