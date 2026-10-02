"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X, CheckCheck, Calendar, AlertCircle, Clock, Trash2 } from "lucide-react";
import { api, NotificationItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

export function NotificationsDrawer({ isOpen, onClose, userId }: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

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
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-200 text-indigo-600">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Notifications</h3>
                  <p className="text-xs text-slate-500">Meeting alerts and updates</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
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
                notifications.map((item) => (
                  <div
                    key={item.notificationId}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 transition-all flex flex-col gap-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(item.type)}
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          {item.type}
                        </span>
                      </div>
                      {item.sentAt && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          {new Date(item.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    {item.meetingTitle && (
                      <h4 className="text-sm font-semibold text-slate-900">{item.meetingTitle}</h4>
                    )}
                    {item.message && (
                      <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
