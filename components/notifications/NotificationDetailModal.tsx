"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  AlertCircle,
  Trash2,
  CheckCheck,
  Check,
  FileText,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, NotificationItem, Meeting } from "@/lib/api";
import { MeetingDetailsModal } from "@/components/meetings/MeetingDetailsModal";
import { useAuth } from "@/lib/auth";

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationItem | null;
  onStatusUpdated?: (notificationId: number, newStatus: string) => void;
}

export function NotificationDetailModal({
  isOpen,
  onClose,
  notification,
  onStatusUpdated,
}: NotificationDetailModalProps) {
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loadingMeeting, setLoadingMeeting] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const [fullMeetingModalOpen, setFullMeetingModalOpen] = useState(false);

  // Fetch linked meeting details if available
  useEffect(() => {
    let isMounted = true;
    if (isOpen && notification?.meetingId) {
      setLoadingMeeting(true);
      api.meetings
        .getById(notification.meetingId)
        .then((data) => {
          if (isMounted) setMeeting(data);
        })
        .catch(() => {
          if (isMounted) setMeeting(null);
        })
        .finally(() => {
          if (isMounted) setLoadingMeeting(false);
        });
    } else {
      setMeeting(null);
      setLoadingMeeting(false);
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, notification?.meetingId]);

  if (!notification) return null;

  const isUnread = notification.status !== "READ";

  const handleMarkAsRead = async () => {
    if (!notification || !isUnread) return;
    setMarkingRead(true);
    try {
      await api.notifications.markAsRead(notification.notificationId);
      onStatusUpdated?.(notification.notificationId, "READ");
      window.dispatchEvent(new CustomEvent("notification-read", { detail: { id: notification.notificationId } }));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    } finally {
      setMarkingRead(false);
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "CONFIRMATION":
        return {
          icon: <Calendar className="w-5 h-5 text-emerald-600" />,
          label: "Meeting Confirmed",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          iconBg: "bg-emerald-100 border-emerald-200 text-emerald-700",
        };
      case "CANCELLATION":
        return {
          icon: <Trash2 className="w-5 h-5 text-rose-600" />,
          label: "Meeting Cancelled",
          color: "bg-rose-50 text-rose-700 border-rose-200",
          iconBg: "bg-rose-100 border-rose-200 text-rose-700",
        };
      case "CHANGE":
        return {
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          label: "Schedule Updated",
          color: "bg-amber-50 text-amber-700 border-amber-200",
          iconBg: "bg-amber-100 border-amber-200 text-amber-700",
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-indigo-600" />,
          label: "Meeting Reminder",
          color: "bg-indigo-50 text-indigo-700 border-indigo-200",
          iconBg: "bg-indigo-100 border-indigo-200 text-indigo-700",
        };
    }
  };

  const typeConfig = getTypeConfig(notification.type);

  const formattedDate = notification.sentAt
    ? new Date(notification.sentAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const formattedTime = notification.sentAt
    ? new Date(notification.sentAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${typeConfig.iconBg}`}>
              {typeConfig.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg">Notification Details</span>
                {isUnread ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Unread
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Read
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Ref ID: #{notification.notificationId}
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Notification Alert Message Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
              {formattedDate && (
                <span>
                  {formattedDate} • {formattedTime}
                </span>
              )}
            </div>

            <div className="pt-1">
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {notification.message || "No additional text provided in this notification."}
              </p>
            </div>
          </div>

          {/* Meeting Context Card (if linked to a meeting) */}
          {notification.meetingId ? (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Associated Meeting
                  </span>
                </div>
                {meeting?.status && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {meeting.status}
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3.5">
                {loadingMeeting ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Loading meeting details...</span>
                  </div>
                ) : meeting ? (
                  <>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{meeting.title}</h4>
                      {meeting.purpose && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{meeting.purpose}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                      {/* Scheduled Time */}
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-semibold uppercase text-slate-400">Date & Time</div>
                          <div className="font-semibold text-slate-800">
                            {new Date(meeting.startTime).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {new Date(meeting.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                            {new Date(meeting.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>

                      {/* Room & Location */}
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-semibold uppercase text-slate-400">Room Location</div>
                          <div className="font-semibold text-slate-800">
                            {meeting.room?.name || "No room assigned"}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {meeting.room?.location || "Main Facility"}
                          </div>
                        </div>
                      </div>

                      {/* Organizer */}
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <User className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-semibold uppercase text-slate-400">Organizer</div>
                          <div className="font-semibold text-slate-800">
                            {meeting.organizer?.name || "System"}
                          </div>
                          <div className="text-slate-500 text-[11px] truncate max-w-[150px]">
                            {meeting.organizer?.email}
                          </div>
                        </div>
                      </div>

                      {/* Attendees */}
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <Users className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] font-semibold uppercase text-slate-400">Participants</div>
                          <div className="font-semibold text-slate-800">
                            {meeting.attendees?.length || 0} Invited
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {meeting.attendees?.filter(a => a.responseStatus === "ACCEPTED").length || 0} Accepted
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFullMeetingModalOpen(true)}
                        className="w-full justify-center gap-1.5 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Inspect Complete Meeting Schedule & Details
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-500">
                    <p className="font-semibold text-slate-700">
                      {notification.meetingTitle || `Meeting #${notification.meetingId}`}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Additional details could not be retrieved or this meeting is no longer active.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
              <FileText className="w-6 h-6 mx-auto mb-1 text-slate-300" />
              This is a general system notification not tied to a specific meeting.
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
            <div>
              {isUnread && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAsRead}
                  isLoading={markingRead}
                  leftIcon={<CheckCheck className="w-4 h-4 text-emerald-600" />}
                  className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-semibold text-emerald-800"
                >
                  Mark as Read
                </Button>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Full Meeting Modal Drilldown */}
      {meeting && (
        <MeetingDetailsModal
          isOpen={fullMeetingModalOpen}
          onClose={() => setFullMeetingModalOpen(false)}
          meeting={meeting}
          currentUser={user}
          isAdmin={user?.role === "ADMIN"}
        />
      )}
    </>
  );
}
