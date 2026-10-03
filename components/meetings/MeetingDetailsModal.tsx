"use client";

import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  Ban,
  Package,
  UserCheck,
  Building,
  Mail,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { Meeting, MeetingStatus, AttendeeResponseStatus, User } from "@/lib/api";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MeetingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  isAdmin: boolean;
  currentUser?: User | null;
  actionLoading: boolean;
  onApprove: (meetingId: number) => void;
  onRequestCancel: (meeting: Meeting) => void;
  onRSVP?: (meetingId: number, status: AttendeeResponseStatus) => void;
}

export function MeetingDetailsModal({
  isOpen,
  onClose,
  meeting,
  isAdmin,
  currentUser,
  actionLoading,
  onApprove,
  onRequestCancel,
  onRSVP,
}: MeetingDetailsModalProps) {
  if (!meeting) return null;

  const getStatusBadge = (status: MeetingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="confirmed">Confirmed</Badge>;
      case "PENDING":
        return <Badge variant="pending">Pending Approval</Badge>;
      case "CANCELLED":
        return <Badge variant="cancelled">Cancelled</Badge>;
      case "COMPLETED":
        return <Badge variant="completed">Completed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getRSVPBadge = (status: AttendeeResponseStatus) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Accepted
          </span>
        );
      case "DECLINED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold">
            <XCircle className="w-3 h-3 text-rose-600" />
            Declined
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
            <HelpCircle className="w-3 h-3 text-amber-600" />
            Awaiting Response
          </span>
        );
    }
  };

  const isOrganizer = meeting.organizer?.userId === currentUser?.userId;
  const userAttendee = meeting.attendees?.find((a) => a.userId === currentUser?.userId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 truncate max-w-md">
            {meeting.title}
          </span>
          {getStatusBadge(meeting.status)}
        </div>
      }
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Schedule & Location Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-500" />
                Schedule Window
              </span>
              <p className="text-slate-800 font-semibold font-mono">
                {meeting.startTime.replace("T", " ").slice(0, 16)} &rarr;{" "}
                {meeting.endTime.replace("T", " ").slice(11, 16)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-500" />
                Room Facility
              </span>
              <p className="text-slate-800 font-semibold">
                {meeting.room?.name || "Facility unassigned"}
                {meeting.room?.location && (
                  <span className="text-slate-500 font-normal"> ({meeting.room.location})</span>
                )}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-slate-500 text-[11px]">
            <div className="flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Organizer:</span>
              <strong className="text-slate-700">{meeting.organizer?.name || "System"}</strong>
              {meeting.organizer?.email && (
                <span className="text-slate-400">({meeting.organizer.email})</span>
              )}
            </div>

            {meeting.room?.capacity && (
              <span className="font-medium text-slate-600">
                Seating Capacity: {meeting.room.capacity}
              </span>
            )}
          </div>
        </div>

        {/* Meeting Agenda / Purpose */}
        {meeting.purpose && (
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Agenda & Purpose
            </h4>
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed">
              {meeting.purpose}
            </div>
          </div>
        )}

        {/* Attendees & RSVP Tracker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              Attendees ({meeting.attendees?.length || 0})
            </h4>

            {/* Current user RSVP quick-toggle if they are an attendee */}
            {userAttendee && onRSVP && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Your RSVP:</span>
                <Button
                  variant={userAttendee.responseStatus === "ACCEPTED" ? "success" : "outline"}
                  size="sm"
                  type="button"
                  onClick={() => onRSVP(meeting.meetingId, "ACCEPTED")}
                  disabled={actionLoading}
                  className="h-7 text-xs px-2.5"
                >
                  Accept
                </Button>
                <Button
                  variant={userAttendee.responseStatus === "DECLINED" ? "danger" : "outline"}
                  size="sm"
                  type="button"
                  onClick={() => onRSVP(meeting.meetingId, "DECLINED")}
                  disabled={actionLoading}
                  className="h-7 text-xs px-2.5"
                >
                  Decline
                </Button>
              </div>
            )}
          </div>

          <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
            {!meeting.attendees || meeting.attendees.length === 0 ? (
              <p className="p-3 text-center text-slate-400 italic">No attendees added.</p>
            ) : (
              meeting.attendees.map((attendee) => (
                <div
                  key={attendee.userId}
                  className="flex items-center justify-between p-2.5 px-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                      {attendee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">{attendee.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">{attendee.email}</span>
                    </div>
                  </div>
                  <div>{getRSVPBadge(attendee.responseStatus)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Equipment & Support Staff Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Equipment Allocated */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-cyan-600" />
              Equipment Allocated ({meeting.materials?.length || 0})
            </h4>
            <div className="max-h-28 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 space-y-1">
              {!meeting.materials || meeting.materials.length === 0 ? (
                <p className="text-slate-400 text-center py-2 italic text-[11px]">
                  No equipment reserved.
                </p>
              ) : (
                meeting.materials.map((mat) => (
                  <div
                    key={mat.materialId}
                    className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-cyan-50/50 text-[11px]"
                  >
                    <span className="font-medium text-slate-800">{mat.name}</span>
                    <span className="font-mono font-bold text-cyan-700">
                      {mat.quantityRequested} units
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Support Staff Assigned */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-violet-600" />
              Staff Assigned ({meeting.staffAssignments?.length || 0})
            </h4>
            <div className="max-h-28 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 space-y-1">
              {!meeting.staffAssignments || meeting.staffAssignments.length === 0 ? (
                <p className="text-slate-400 text-center py-2 italic text-[11px]">
                  No support staff requested.
                </p>
              ) : (
                meeting.staffAssignments.map((st) => (
                  <div
                    key={st.staffId}
                    className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-violet-50/50 text-[11px]"
                  >
                    <span className="font-medium text-slate-800">{st.name}</span>
                    <span className="text-[10px] text-violet-600 font-semibold">
                      {st.assignedRole || st.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {/* Quick Approve Button */}
            {isAdmin && meeting.status === "PENDING" && (
              <Button
                variant="success"
                size="sm"
                type="button"
                onClick={() => onApprove(meeting.meetingId)}
                disabled={actionLoading}
                leftIcon={<Check className="w-3.5 h-3.5 shrink-0" />}
              >
                Approve Meeting
              </Button>
            )}

            {/* Quick Cancel Button */}
            {(isAdmin || isOrganizer) &&
              (meeting.status === "PENDING" || meeting.status === "CONFIRMED") && (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => onRequestCancel(meeting)}
                  disabled={actionLoading}
                  leftIcon={<Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                >
                  Cancel Meeting
                </Button>
              )}
          </div>

          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
