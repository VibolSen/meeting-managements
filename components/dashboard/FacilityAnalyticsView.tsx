"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Calendar,
  Building2,
  Users,
  AlertTriangle,
  Download,
  RefreshCw,
  Flame,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";
import { api, AnalyticsSummary, RoomUtilization, DepartmentUsage, HeatmapCell } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/Toast";
import * as XLSX from "xlsx";

export function FacilityAnalyticsView() {
  const toast = useToast();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRangeDays, setTimeRangeDays] = useState<number>(30);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const past = new Date();
      past.setDate(past.getDate() - timeRangeDays);

      const res = await api.analytics.getSummary(past.toISOString(), now.toISOString());
      setData(res);
    } catch {
      toast.error("Analytics Load Error", "Could not retrieve facility utilization data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRangeDays, toast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportExcel = () => {
    if (!data) return;
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Summary Overview
      const summaryRows = [
        { Metric: "Total Bookings", Value: data.totalBookings },
        { Metric: "Completed Meetings", Value: data.completedBookings },
        { Metric: "Cancelled Bookings", Value: data.cancelledBookings },
        { Metric: "No-Show Auto-Releases", Value: data.autoReleasedNoShows },
        { Metric: "Total Meeting Hours", Value: data.totalMeetingHours },
        { Metric: "Overall Facility Utilization", Value: `${data.overallFacilityUtilizationPct}%` },
        { Metric: "Cancellation Rate", Value: `${data.cancellationRatePct}%` },
        { Metric: "No-Show Rate", Value: `${data.noShowRatePct}%` },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Overview");

      // Sheet 2: Room Utilization
      const roomRows = data.roomUtilizations.map((r: RoomUtilization) => ({
        "Room ID": r.roomId,
        "Room Name": r.roomName,
        Capacity: r.capacity,
        "Total Meetings": r.totalMeetings,
        "Total Hours": r.totalHours,
        "Utilization %": `${r.utilizationPct}%`,
      }));
      const wsRooms = XLSX.utils.json_to_sheet(roomRows);
      XLSX.utils.book_append_sheet(wb, wsRooms, "Rooms Utilization");

      // Sheet 3: Department Usage
      const deptRows = data.departmentUsages.map((d: DepartmentUsage) => ({
        Department: d.departmentName,
        "Total Bookings": d.totalMeetings,
        "Booked Hours": d.totalHours,
        "Share %": `${d.percentage}%`,
      }));
      const wsDept = XLSX.utils.json_to_sheet(deptRows);
      XLSX.utils.book_append_sheet(wb, wsDept, "Department Share");

      XLSX.writeFile(wb, `Facility_Utilization_Report_${timeRangeDays}D.xlsx`);
      toast.success("Report Exported", "Excel report downloaded successfully.");
    } catch {
      toast.error("Export Failed", "Could not generate spreadsheet.");
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return "bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800/30 dark:text-slate-500 dark:border-slate-800";
    if (intensity < 0.25) return "bg-indigo-50 text-indigo-700 border-indigo-100 font-semibold dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/50";
    if (intensity < 0.6) return "bg-indigo-100 text-indigo-800 border-indigo-200 font-bold dark:bg-indigo-900/60 dark:text-indigo-200 dark:border-indigo-700/60";
    if (intensity < 0.85) return "bg-indigo-500 text-white border-indigo-600 font-extrabold dark:bg-indigo-600 dark:border-indigo-500";
    return "bg-rose-500 text-white border-rose-600 font-black shadow-xs shadow-rose-200 animate-pulse dark:bg-rose-600 dark:border-rose-500";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Facility Space Intelligence & Utilization
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time analytics on room efficiency, peak hours bottlenecks, and departmental space demand.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            {[
              { days: 7, label: "7 Days" },
              { days: 30, label: "30 Days" },
              { days: 90, label: "90 Days" },
            ].map((t) => (
              <button
                key={t.days}
                onClick={() => setTimeRangeDays(t.days)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRangeDays === t.days
                    ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefreshing(true);
              fetchAnalytics();
            }}
            disabled={loading || refreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />}
            className="text-xs"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportExcel}
            disabled={!data || loading}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs shadow-xs"
          >
            Export Report
          </Button>
        </div>
      </div>

      {loading && !data ? (
        <div className="p-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-500">Computing facility telemetry & usage algorithms...</p>
        </div>
      ) : data ? (
        <>
          {/* 1. EXECUTIVE KPI METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Facility Utilization */}
            <Card className="p-5 border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/30 dark:from-[#111827] dark:to-indigo-950/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Facility Utilization Rate
                </span>
                <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {data.overallFacilityUtilizationPct}%
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Optimal
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                  style={{ width: `${Math.min(100, data.overallFacilityUtilizationPct)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Based on operating hours (08:00 – 18:00)
              </p>
            </Card>

            {/* Total Meeting Hours */}
            <Card className="p-5 border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30 dark:from-[#111827] dark:to-blue-950/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Booked Hours
                </span>
                <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {data.totalMeetingHours} hrs
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Across <strong>{data.totalBookings}</strong> total reservations
              </p>
            </Card>

            {/* Completion vs Cancellation */}
            <Card className="p-5 border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/30 dark:from-[#111827] dark:to-emerald-950/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Completed Sessions
                </span>
                <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {data.completedBookings}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ({Math.round(((data.completedBookings || 1) / (data.totalBookings || 1)) * 100)}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Cancelled: <strong>{data.cancelledBookings}</strong></span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">{data.cancellationRatePct}% rate</span>
              </div>
            </Card>

            {/* Ghost Room Prevention & Auto-Releases */}
            <Card className="p-5 border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-rose-50/30 dark:from-[#111827] dark:to-rose-950/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Ghost Rooms Auto-Released
                </span>
                <span className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                  {data.autoReleasedNoShows}
                </span>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/60">
                  {data.noShowRatePct}% No-show
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                Recovered immediately by auto-release job
              </p>
            </Card>
          </div>

          {/* 2. PEAK BOOKING HOURS HEATMAP */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  Peak Booking Hours & Bottleneck Heatmap
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Density matrix across standard working days (Mon–Fri) and operating facility hours (08:00 to 18:00).
                </p>
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Free</span>
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                  <span className="w-3.5 h-3.5 rounded bg-indigo-100 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800" />
                  <span className="w-3.5 h-3.5 rounded bg-indigo-500" />
                  <span className="w-3.5 h-3.5 rounded bg-rose-500" />
                </div>
                <span>Peak Congestion</span>
              </div>
            </div>

            {/* Heatmap Matrix Grid */}
            <div className="overflow-x-auto pb-2">
              <table className="w-full text-xs text-center border-separate border-spacing-1.5 min-w-[650px]">
                <thead>
                  <tr>
                    <th className="text-left font-bold text-slate-400 dark:text-slate-500 p-1 w-16">Day</th>
                    {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((h) => (
                      <th key={h} className="font-mono font-bold text-slate-500 dark:text-slate-400 p-1">
                        {String(h).padStart(2, "0")}:00
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 1, name: "Mon" },
                    { id: 2, name: "Tue" },
                    { id: 3, name: "Wed" },
                    { id: 4, name: "Thu" },
                    { id: 5, name: "Fri" },
                  ].map((day) => (
                    <tr key={day.id}>
                      <td className="text-left font-bold text-slate-700 dark:text-slate-300 py-1">{day.name}</td>
                      {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((hour) => {
                        const cell = data.heatmap.find(
                          (c: HeatmapCell) => c.dayOfWeek === day.id && c.hour === hour
                        );
                        const count = cell?.meetingCount || 0;
                        const intensity = cell?.intensity || 0;

                        return (
                          <td
                            key={hour}
                            title={`${day.name} ${hour}:00 — ${count} meeting(s)`}
                            className={`h-10 rounded-xl border text-xs transition-all cursor-pointer hover:scale-105 ${getIntensityColor(
                              intensity
                            )}`}
                          >
                            <span>{count > 0 ? count : "·"}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 3. ROOM UTILIZATION & DEPARTMENT SHARE (2-COLUMN GRID) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Room Utilization Leaderboard */}
            <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    Meeting Room Efficiency & Utilization
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Highest to lowest utilized conference rooms.
                  </p>
                </div>
                <Badge variant="neutral">{data.roomUtilizations.length} Rooms</Badge>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {data.roomUtilizations.map((room: RoomUtilization) => (
                  <div key={room.roomId} className="space-y-1.5 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{room.roomName}</span>
                        <span className="text-[11px] text-slate-400 font-medium">({room.capacity} seats)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 dark:text-slate-400 font-mono font-medium">{room.totalHours} hrs</span>
                        <span className="font-black font-mono text-indigo-700 dark:text-indigo-400 w-12 text-right">
                          {room.utilizationPct}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-200/70 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          room.utilizationPct >= 60
                            ? "bg-emerald-500"
                            : room.utilizationPct >= 30
                            ? "bg-indigo-600"
                            : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(100, room.utilizationPct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Right: Department Space Demand Breakdown */}
            <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Department Usage Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Share of total meeting hours consumed by department.
                  </p>
                </div>
                <Badge variant="neutral">{data.departmentUsages.length} Teams</Badge>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {data.departmentUsages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No department data logged for this period.
                  </div>
                ) : (
                  data.departmentUsages.map((dept: DepartmentUsage, idx: number) => (
                    <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{dept.departmentName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">{dept.totalMeetings} meetings</span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{dept.totalHours} hrs</span>
                          <span className="font-black font-mono text-blue-700 dark:text-blue-400 w-12 text-right">
                            {dept.percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-2 bg-slate-200/70 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, dept.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
