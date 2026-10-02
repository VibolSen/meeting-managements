"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Wrench,
  RefreshCw,
  Plus,
} from "lucide-react";
import { api, DashboardSummary, User } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardViewProps {
  currentUser: User | null;
  onNavigate: (tab: "dashboard" | "booking" | "calendar" | "meetings" | "resources") => void;
}

export function DashboardView({ currentUser, onNavigate }: DashboardViewProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await api.dashboard.getSummary();
      setSummary(data);
    } catch (err: any) {
      setApiError(err?.message || "Could not connect to backend API (http://localhost:8080/api).");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Backend API Connection Alert */}
      {apiError && (
        <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>API Notice:</strong> {apiError} Ensure your Spring Boot backend is running.
            </span>
          </div>
          <button
            onClick={loadData}
            className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 p-4 sm:p-5 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Real-Time Operational Overview</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {currentUser?.name || "Team"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Monitor room utilization, coordinate equipment logistics, and manage conflict-free meeting reservations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              isLoading={loading}
              className="h-8.5 text-xs px-3"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate("booking")}
              className="h-8.5 text-xs px-3"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Schedule Meeting
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {/* Card 1: Meetings */}
        <Card className="p-3.5 sm:p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Meetings
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {loading ? "..." : summary?.totalMeetings ?? 0}
              </h3>
            </div>
            <div className="w-8.5 h-8.5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px]">
            <span className="text-emerald-700 font-semibold">
              {summary?.confirmedMeetings ?? 0} Confirmed
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200/60">
              {summary?.pendingMeetings ?? 0} Pending
            </span>
          </div>
        </Card>

        {/* Card 2: Rooms */}
        <Card className="p-3.5 sm:p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Meeting Rooms
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {loading ? "..." : summary?.activeRooms ?? 0}
                <span className="text-xs font-normal text-slate-500 ml-1">
                  / {summary?.totalRooms ?? 0}
                </span>
              </h3>
            </div>
            <div className="w-8.5 h-8.5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Ready for booking</span>
            <Badge variant="available" size="sm">Active</Badge>
          </div>
        </Card>

        {/* Card 3: Support Staff */}
        <Card className="p-3.5 sm:p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Support Staff
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {loading ? "..." : summary?.availableStaff ?? 0}
                <span className="text-xs font-normal text-slate-500 ml-1">
                  / {summary?.totalStaff ?? 0}
                </span>
              </h3>
            </div>
            <div className="w-8.5 h-8.5 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-200 shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Available for assignment</span>
            <Badge variant="confirmed" size="sm">Available</Badge>
          </div>
        </Card>

        {/* Card 4: Equipment Inventory */}
        <Card className="p-3.5 sm:p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Materials & Gear
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {loading ? "..." : summary?.totalMaterials ?? 0}
              </h3>
            </div>
            <div className="w-8.5 h-8.5 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Tracked equipment</span>
            <span
              className="text-indigo-600 font-semibold cursor-pointer hover:underline"
              onClick={() => onNavigate("resources")}
            >
              View stock
            </span>
          </div>
        </Card>
      </div>

      {/* Main Content: Upcoming Meetings & Action Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Left Column: Upcoming Meetings Timeline */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Upcoming Meetings Schedule</h3>
              <p className="text-[11px] text-slate-500">Next 7 days schedule across all rooms</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("calendar")}
              className="h-7.5 px-2 text-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Full Calendar
            </Button>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="p-6 text-center text-slate-400">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs">Fetching schedule...</span>
              </div>
            ) : !summary?.upcomingMeetings || summary.upcomingMeetings.length === 0 ? (
              <Card className="p-6 text-center text-slate-500">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
                <h4 className="text-xs font-semibold text-slate-800">No Upcoming Meetings</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                  There are no scheduled meetings for the next 7 days. Click below to book a room.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-3 h-8 text-xs"
                  onClick={() => onNavigate("booking")}
                >
                  Book a Room Now
                </Button>
              </Card>
            ) : (
              summary.upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.meetingId}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-9.5 h-9.5 rounded-lg bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[9px] font-bold text-indigo-600 uppercase leading-none">
                        {new Date(meeting.startTime).toLocaleDateString([], { month: "short" })}
                      </span>
                      <span className="text-xs font-extrabold text-indigo-900 leading-tight">
                        {new Date(meeting.startTime).getDate()}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          {meeting.title}
                        </h4>
                        <Badge
                          size="sm"
                          variant={
                            meeting.status === "CONFIRMED"
                              ? "confirmed"
                              : meeting.status === "PENDING"
                              ? "pending"
                              : "cancelled"
                          }
                        >
                          {meeting.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(meeting.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {new Date(meeting.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {meeting.room?.name || "Room"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          {meeting.attendees?.length || 0} attendees
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-xs h-7.5 px-2.5"
                    onClick={() => onNavigate("meetings")}
                  >
                    View Details
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Alerts & Quick Action Cards */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900">Action Center</h3>

          {/* Pending Approval Notice if any */}
          {summary?.pendingMeetings && summary.pendingMeetings > 0 ? (
            <div className="p-3 sm:p-3.5 rounded-xl border border-amber-200 bg-amber-50/80 space-y-2.5 shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-amber-900">
                    {summary.pendingMeetings} Large Meeting{summary.pendingMeetings > 1 ? "s" : ""} Pending Approval
                  </h4>
                  <p className="text-[11px] text-amber-700 leading-snug">
                    Bookings for high-capacity rooms (&ge; 20) require administrative confirmation.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full h-8 text-xs font-semibold bg-amber-600 hover:bg-amber-700 border-amber-600 shadow-amber-600/20"
                onClick={() => onNavigate("meetings")}
              >
                Review & Approve Now
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Approvals Up-To-Date</span>
              </div>
              <p className="text-[11px] text-slate-500">
                All meeting requests have been processed. No boardroom approval pending.
              </p>
            </div>
          )}

          {/* System Highlights Widget */}
          <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-xs">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Quick Shortcuts
            </h4>

            <div className="space-y-1.5">
              <button
                onClick={() => onNavigate("booking")}
                className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 group-hover:scale-105 transition-transform">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">New Reservation</p>
                    <p className="text-[10px] text-slate-500">Book room with equipment & staff</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate("calendar")}
                className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 group-hover:scale-105 transition-transform">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">Room Timeline</p>
                    <p className="text-[10px] text-slate-500">Check live slot availability</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate("resources")}
                className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 group-hover:scale-105 transition-transform">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">Inventory & Staff</p>
                    <p className="text-[10px] text-slate-500">Manage equipment stock & roster</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
