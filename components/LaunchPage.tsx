"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Briefcase,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Server,
  Activity,
  Cpu,
} from "lucide-react";
import { api, DashboardSummary, User } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function LaunchPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTelemetry = async () => {
      setLoading(true);
      try {
        const [sumData, usersData] = await Promise.all([
          api.dashboard.getSummary().catch(() => null),
          api.users.getAll().catch(() => []),
        ]);

        if (sumData) {
          setSummary(sumData);
          setApiConnected(true);
        } else {
          setApiConnected(false);
        }

        if (usersData) {
          setUsers(usersData);
        }
      } catch {
        setApiConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchTelemetry();
  }, []);

  const adminUser = users.find((u) => u.role === "ADMIN");
  const organizerUser = users.find((u) => u.role === "ORGANIZER");
  const employeeUser = users.find((u) => u.role === "EMPLOYEE");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center p-1.5 overflow-hidden">
              <img
                src="/default logo/meeting-time.svg"
                alt="Meeting Management System Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  MeetingHub
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  MMS Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Centralized Room Booking & Facility Logistics
              </p>
            </div>
          </div>

          {/* Right Status & Launch Portal Button */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiConnected
                    ? "bg-emerald-500 animate-pulse"
                    : apiConnected === false
                    ? "bg-rose-500"
                    : "bg-amber-500 animate-spin"
                }`}
              />
              <span className="font-medium">
                {apiConnected
                  ? "Backend Connected"
                  : apiConnected === false
                  ? "Backend Offline"
                  : "Checking API..."}
              </span>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sign In</span>
            </Link>

            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Launch Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-20">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Welcome to the Official Launchpad</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Master Every Meeting. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
              Zero Conflicts.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Eliminate double-booking conflicts, automate equipment allocation, and coordinate support personnel seamlessly across all corporate conference rooms.
          </p>

          {/* Action Center Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Console</span>
            </Link>

            <Link
              href="/organizer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-slate-800 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-xs hover:-translate-y-0.5 transition-all"
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Organizer Workspace</span>
            </Link>

            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-slate-800 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-xs hover:-translate-y-0.5 transition-all"
            >
              <Users className="w-4 h-4 text-violet-600" />
              <span>General Portal</span>
            </Link>
          </div>
        </section>

        {/* Workspaces Cards Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Select Your Work Environment
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Role-Based Workspaces
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              Each workspace provides tailored tools, governance capabilities, and permissions for your team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Admin */}
            <div className="relative group rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <Badge variant="confirmed">ADMIN</Badge>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900">
                    Administrator Console
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Full governance over meeting rooms, hardware inventory, support staff assignments, and reservation approvals.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Default Administrator:</span>
                    <strong className="text-slate-800">
                      {adminUser?.name || "Vibol SEN"}
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Authorized Scope:</span>
                    <span className="text-indigo-600 font-semibold">
                      Full System Control
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/admin/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>Launch Admin Console</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Organizer */}
            <div className="relative group rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <Badge variant="pending">ORGANIZER</Badge>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900">
                    Organizer Workspace
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Reserve conference halls with interactive conflict detection, request equipment, and schedule support personnel.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Default Account:</span>
                    <strong className="text-slate-800">
                      {organizerUser?.name || "Meeting Organizer"}
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Workflow:</span>
                    <span className="text-emerald-700 font-semibold">
                      Booking Wizard & Logistics
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/organizer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <span>Launch Organizer Space</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 3: Employee / General Portal */}
            <div className="relative group rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xs hover:shadow-xl hover:border-violet-300 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <Badge variant="neutral">EMPLOYEE</Badge>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900">
                    General Portal
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    View room availability schedules, manage attendance RSVPs, inspect meeting agendas, and receive notifications.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Default Account:</span>
                    <strong className="text-slate-800">
                      {employeeUser?.name || "Alice Johnson"}
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Access Mode:</span>
                    <span className="text-violet-700 font-semibold">
                      Full Schedule & RSVP
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/portal"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/20 transition-all"
                >
                  <span>Enter General Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Live System Telemetry Overview */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Real-Time Database Feed
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Operational Telemetry
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Live from Spring Boot API (MySQL)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Rooms
                </p>
                <h4 className="text-3xl font-black text-slate-900 mt-1">
                  {loading ? "..." : summary?.activeRooms ?? 0}
                  <span className="text-sm font-normal text-slate-500 ml-1">
                    / {summary?.totalRooms ?? 0}
                  </span>
                </h4>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium mt-3 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready for reservation</span>
              </p>
            </Card>

            <Card className="p-5 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Support Staff
                </p>
                <h4 className="text-3xl font-black text-slate-900 mt-1">
                  {loading ? "..." : summary?.availableStaff ?? 0}
                  <span className="text-sm font-normal text-slate-500 ml-1">
                    / {summary?.totalStaff ?? 0}
                  </span>
                </h4>
              </div>
              <p className="text-[11px] text-indigo-700 font-medium mt-3 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>Available technicians</span>
              </p>
            </Card>

            <Card className="p-5 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Equipment Stock
                </p>
                <h4 className="text-3xl font-black text-slate-900 mt-1">
                  {loading ? "..." : summary?.totalMaterials ?? 0}
                </h4>
              </div>
              <p className="text-[11px] text-amber-700 font-medium mt-3 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Projectors & gear</span>
              </p>
            </Card>

            <Card className="p-5 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Scheduled Meetings
                </p>
                <h4 className="text-3xl font-black text-slate-900 mt-1">
                  {loading ? "..." : summary?.totalMeetings ?? 0}
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-3 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Confirmed & pending</span>
              </p>
            </Card>
          </div>
        </section>

        {/* Feature Capabilities Grid */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xs">
          <div className="max-w-2xl mb-8">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Meeting Management Capabilities
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Built with precision to ensure efficient, error-free meeting logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Zero Double-Booking Guarantee
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Atomic time-interval conflict detection ensures no two meetings can ever reserve overlapping slots in the same room.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Automated Inventory Tracking
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Projectors, clickers, whiteboards, and catering are allocated dynamically and automatically restored upon cancellation.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Support Personnel Dispatch
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Assign certified technicians and facilitators based on live availability status without manual coordination.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img
              src="/default logo/meeting-time.svg"
              alt="MMS Logo"
              className="w-6 h-6 object-contain"
            />
            <span className="font-semibold text-slate-700">
              Meeting Management System (MMS)
            </span>
            <span>•</span>
            <span>Clean Light Edition</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="hover:text-indigo-600 transition-colors">
              Admin
            </Link>
            <Link href="/organizer" className="hover:text-indigo-600 transition-colors">
              Organizer
            </Link>
            <Link href="/portal" className="hover:text-indigo-600 transition-colors">
              Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
