"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Bell,
  CheckCheck,
  Calendar,
  AlertCircle,
  Clock,
  Trash2,
  Filter,
  RefreshCw,
} from "lucide-react";
import { api, NotificationItem, NotificationType } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function NotificationFullPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const fetchNotifications = useCallback(async () => {
    const effectiveUserId = user?.userId || 2;
    setLoading(true);
    try {
      const data = await api.notifications.getByUser(effectiveUserId);
      setNotifications(data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await api.notifications.updateStatus(notificationId, "SENT");
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, status: "SENT" } : n
        )
      );
    } catch {
      // Ignored
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "CONFIRMATION":
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case "CANCELLATION":
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      case "CHANGE":
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const filteredNotifications = useMemo(() => {
    if (typeFilter === "ALL") return notifications;
    return notifications.filter((n) => n.type === typeFilter);
  }, [notifications, typeFilter]);

  const stats = useMemo(() => {
    return {
      total: notifications.length,
      confirmations: notifications.filter((n) => n.type === "CONFIRMATION").length,
      reminders: notifications.filter((n) => n.type === "REMINDER").length,
      cancellations: notifications.filter((n) => n.type === "CANCELLATION").length,
    };
  }, [notifications]);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Notification Center
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold font-mono">
                {stats.total}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live updates on meeting approvals, attendee confirmations, schedule modifications, and cancellations.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={fetchNotifications}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
        >
          Refresh Alerts
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: "ALL", label: `All Alerts (${stats.total})` },
          { id: "CONFIRMATION", label: `Confirmations (${stats.confirmations})` },
          { id: "REMINDER", label: `Reminders (${stats.reminders})` },
          { id: "CANCELLATION", label: `Cancellations (${stats.cancellations})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTypeFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              typeFilter === tab.id
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
            <CheckCheck className="w-12 h-12 mb-3 text-slate-300 stroke-[1.5]" />
            <h4 className="text-sm font-bold text-slate-800">All Caught Up!</h4>
            <p className="text-xs text-slate-500 mt-1">No notifications found under this filter.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.notificationId}
              className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">
                      {n.meetingTitle || "Meeting Alert"}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                      {n.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {n.message || "No additional message details provided."}
                  </p>

                  <div className="text-[11px] text-slate-400 pt-0.5">
                    {n.sentAt ? new Date(n.sentAt).toLocaleString() : "Just now"}
                  </div>
                </div>
              </div>

              {n.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(n.notificationId)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 transition-colors shrink-0 cursor-pointer"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationFullPage;
