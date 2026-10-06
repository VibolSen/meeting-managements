"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  X,
  CheckCheck,
  Calendar,
  AlertCircle,
  Clock,
  Trash2,
  Check,
  ChevronRight,
} from "lucide-react";
import { api, NotificationItem } from "@/lib/api";
import { NotificationDetailModal } from "@/components/notifications/NotificationDetailModal";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

export function NotificationsDrawer({ isOpen, onClose, userId }: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await api.notifications.getByUser(userId);
      setNotifications(data || []);
    } catch {
      // Clean error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, userId]);

  // Listen for outside notification-read events
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

  const unreadCount = notifications.filter((n) => n.status !== "READ").length;

  const handleMarkAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;
    setMarkingAllRead(true);
    try {
      await api.notifications.markAllAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
      window.dispatchEvent(new CustomEvent("notification-read"));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleMarkSingleAsRead = async (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    try {
      await api.notifications.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId ? { ...n, status: "READ" } : n))
      );
      window.dispatchEvent(new CustomEvent("notification-read", { detail: { id: notificationId } }));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleCardClick = (item: NotificationItem) => {
    setSelectedNotification(item);
    setDetailModalOpen(true);

    // Auto mark as read upon clicking the card if it was unread
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "CONFIRMATION":
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case "CANCELLATION":
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      case "CHANGE":
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50"
            />

            {/* Drawer Slide-in */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-200 text-indigo-600 relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">Notifications</h3>
                      {unreadCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold font-mono">
                          {unreadCount} new
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                          All read
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Meeting alerts and updates</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      disabled={markingAllRead}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{markingAllRead ? "Marking..." : "Mark all read"}</span>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    aria-label="Close notifications drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                    <CheckCheck className="w-12 h-12 mb-3 text-slate-300 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-700">You're all caught up!</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      No new meeting requests, schedule changes, or cancellation alerts.
                    </p>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const isUnread = item.status !== "READ";
                    return (
                      <div
                        key={item.notificationId}
                        onClick={() => handleCardClick(item)}
                        className={`group p-4 rounded-xl border transition-all flex flex-col gap-2 shadow-xs cursor-pointer relative ${
                          isUnread
                            ? "bg-white border-l-4 border-l-indigo-600 border-slate-200/90 hover:bg-indigo-50/20 hover:border-indigo-300 hover:shadow-md"
                            : "bg-slate-50/70 border-slate-200 text-slate-500 hover:bg-slate-100/90"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getNotificationIcon(item.type)}
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider ${
                                isUnread ? "text-slate-800" : "text-slate-500"
                              }`}
                            >
                              {item.type}
                            </span>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {item.sentAt && (
                              <span className="text-[11px] text-slate-400 font-medium">
                                {new Date(item.sentAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}

                            {isUnread ? (
                              <button
                                type="button"
                                onClick={(e) => handleMarkSingleAsRead(e, item.notificationId)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-indigo-100 rounded-md text-indigo-600 transition-opacity"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-300" />
                            )}
                          </div>
                        </div>

                        {item.meetingTitle && (
                          <h4
                            className={`text-sm font-semibold truncate ${
                              isUnread ? "text-slate-900 font-bold" : "text-slate-700"
                            }`}
                          >
                            {item.meetingTitle}
                          </h4>
                        )}

                        {item.message && (
                          <p
                            className={`text-xs line-clamp-2 leading-relaxed ${
                              isUnread ? "text-slate-600" : "text-slate-500"
                            }`}
                          >
                            {item.message}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 text-[11px] text-slate-400">
                          <span>
                            {item.sentAt
                              ? new Date(item.sentAt).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Recent"}
                          </span>
                          <span className="flex items-center gap-1 text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            View details
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
