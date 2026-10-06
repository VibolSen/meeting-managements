"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Bell,
  CheckCheck,
  Calendar,
  AlertCircle,
  Clock,
  Trash2,
  RefreshCw,
  Check,
  ChevronRight,
} from "lucide-react";
import { api, NotificationItem, NotificationType } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { NotificationDetailModal } from "@/components/notifications/NotificationDetailModal";

export function NotificationFullPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

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

  // Sync with global notification-read events
  useEffect(() => {
    const handleReadEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ id?: number }>;
      if (customEvent.detail?.id) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === customEvent.detail.id ? { ...n, status: "READ" } : n
          )
        );
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
      }
    };

    window.addEventListener("notification-read", handleReadEvent);
    return () => window.removeEventListener("notification-read", handleReadEvent);
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.status !== "READ").length;
  }, [notifications]);

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    try {
      await api.notifications.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, status: "READ" } : n
        )
      );
      window.dispatchEvent(
        new CustomEvent("notification-read", { detail: { id: notificationId } })
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const effectiveUserId = user?.userId || 2;
    if (unreadCount === 0) return;
    setMarkingAllRead(true);
    try {
      await api.notifications.markAllAsRead(effectiveUserId);
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
      window.dispatchEvent(new CustomEvent("notification-read"));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleCardClick = (item: NotificationItem) => {
    setSelectedNotification(item);
    setDetailModalOpen(true);

    if (item.status !== "READ") {
      api.notifications.markAsRead(item.notificationId).then(() => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === item.notificationId ? { ...n, status: "READ" } : n
          )
        );
        window.dispatchEvent(
          new CustomEvent("notification-read", { detail: { id: item.notificationId } })
        );
      }).catch(() => {});
    }
  };

  const handleModalStatusUpdated = (notificationId: number, newStatus: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === notificationId ? { ...n, status: newStatus as any } : n))
    );
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
    if (activeFilter === "ALL") return notifications;
    if (activeFilter === "UNREAD") return notifications.filter((n) => n.status !== "READ");
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const stats = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter((n) => n.status !== "READ").length,
      confirmations: notifications.filter((n) => n.type === "CONFIRMATION").length,
      reminders: notifications.filter((n) => n.type === "REMINDER").length,
      changes: notifications.filter((n) => n.type === "CHANGE").length,
      cancellations: notifications.filter((n) => n.type === "CANCELLATION").length,
    };
  }, [notifications]);

  return (
    <>
      <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-slate-900/95 dark:via-[#111827] dark:to-slate-900/90 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Notification Center
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-transparent dark:border-indigo-800/60 text-xs font-bold font-mono">
                  {stats.total}
                </span>
                {stats.unread > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-transparent dark:border-amber-800/60 text-xs font-bold">
                    {stats.unread} unread
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Live updates on meeting approvals, attendee confirmations, schedule modifications, and cancellations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleMarkAllAsRead}
                isLoading={markingAllRead}
                leftIcon={<CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-semibold"
              >
                Mark All Read
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={fetchNotifications}
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: "ALL", label: `All Alerts (${stats.total})` },
            { id: "UNREAD", label: `Unread (${stats.unread})` },
            { id: "CONFIRMATION", label: `Confirmations (${stats.confirmations})` },
            { id: "REMINDER", label: `Reminders (${stats.reminders})` },
            { id: "CHANGE", label: `Updates (${stats.changes})` },
            { id: "CANCELLATION", label: `Cancellations (${stats.cancellations})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === tab.id
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
            filteredNotifications.map((n) => {
              const isUnread = n.status !== "READ";
              return (
                <div
                  key={n.notificationId}
                  onClick={() => handleCardClick(n)}
                  className={`group p-4 sm:p-5 transition-all flex items-start justify-between gap-4 cursor-pointer relative ${
                    isUnread
                      ? "bg-white border-l-4 border-l-indigo-600 hover:bg-indigo-50/20"
                      : "bg-slate-50/60 hover:bg-slate-100/70 opacity-90"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                      {getNotificationIcon(n.type)}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs ${
                            isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                          }`}
                        >
                          {n.meetingTitle || "Meeting Alert"}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          {n.type}
                        </span>
                        {isUnread ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            New
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-400">
                            <Check className="w-2.5 h-2.5 text-emerald-500" />
                            Read
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-xs leading-relaxed ${
                          isUnread ? "text-slate-700 font-medium" : "text-slate-500"
                        }`}
                      >
                        {n.message || "No additional message details provided."}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span>{n.sentAt ? new Date(n.sentAt).toLocaleString() : "Just now"}</span>
                        <span className="hidden sm:inline-flex items-center gap-1 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          Click to view details
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isUnread && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(e, n.notificationId)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Mark Read</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Notification Detail Card Popup Modal */}
      <NotificationDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        notification={selectedNotification}
        onStatusUpdated={handleModalStatusUpdated}
      />
    </>
  );
}

export default NotificationFullPage;
