"use client";

import React, { useState, useEffect } from "react";
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
  FileText,
  CheckSquare,
  Paperclip,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  Send,
  Edit3,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import {
  Meeting,
  MeetingStatus,
  AttendeeResponseStatus,
  User,
  MeetingMinutes,
  ActionItem,
  MeetingAttachment,
  ActionItemStatus,
  api,
} from "@/lib/api";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarSyncDropdown } from "@/components/meetings/CalendarSyncDropdown";
import { useToast } from "@/components/Toast";

type MeetingTab = "overview" | "minutes" | "actions" | "attachments";

interface MeetingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  isAdmin?: boolean;
  currentUser?: User | null;
  actionLoading?: boolean;
  onApprove?: (meetingId: number) => void;
  onRequestCancel?: (meeting: Meeting) => void;
  onRSVP?: (meetingId: number, status: AttendeeResponseStatus) => void;
  onCheckIn?: (meetingId: number) => void;
}

export function MeetingDetailsModal({
  isOpen,
  onClose,
  meeting,
  isAdmin = false,
  currentUser,
  actionLoading = false,
  onApprove,
  onRequestCancel,
  onRSVP,
  onCheckIn,
}: MeetingDetailsModalProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<MeetingTab>("overview");
  const [checkingIn, setCheckingIn] = useState(false);

  // Lifecycle Productivity Data
  const [minutes, setMinutes] = useState<MeetingMinutes | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [attachments, setAttachments] = useState<MeetingAttachment[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  // Minutes Form State
  const [isEditingMinutes, setIsEditingMinutes] = useState(false);
  const [agendaText, setAgendaText] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [keyDecisionsText, setKeyDecisionsText] = useState("");
  const [savingMinutes, setSavingMinutes] = useState(false);

  // Action Items Form State
  const [showAddAction, setShowAddAction] = useState(false);
  const [taskDescription, setTaskDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState<number | undefined>(undefined);
  const [dueDate, setDueDate] = useState("");
  const [savingAction, setSavingAction] = useState(false);

  // Attachments Form State
  const [showAddAttachment, setShowAddAttachment] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("DOCUMENT");
  const [savingAttachment, setSavingAttachment] = useState(false);

  const isOrganizer = meeting?.organizer?.userId === currentUser?.userId;
  const canManageProductivity = isAdmin || isOrganizer;

  // Load minutes, actions, and attachments when modal is opened
  useEffect(() => {
    let isMounted = true;
    if (isOpen && meeting?.meetingId) {
      setLoadingExtras(true);
      Promise.all([
        api.meetings.getMinutes(meeting.meetingId).catch(() => null),
        api.meetings.getActionItems(meeting.meetingId).catch(() => []),
        api.meetings.getAttachments(meeting.meetingId).catch(() => []),
      ])
        .then(([minutesData, actionsData, attachmentsData]) => {
          if (!isMounted) return;
          setMinutes(minutesData);
          if (minutesData) {
            setAgendaText(minutesData.agenda || "");
            setSummaryText(minutesData.summary || "");
            setKeyDecisionsText(minutesData.keyDecisions || "");
          } else {
            setAgendaText(meeting.purpose || "");
            setSummaryText("");
            setKeyDecisionsText("");
          }
          setActionItems(actionsData || []);
          setAttachments(attachmentsData || []);
        })
        .finally(() => {
          if (isMounted) setLoadingExtras(false);
        });
    } else {
      setActiveTab("overview");
      setIsEditingMinutes(false);
      setShowAddAction(false);
      setShowAddAttachment(false);
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, meeting?.meetingId, meeting?.purpose]);

  if (!meeting) return null;

  const userAttendee = meeting.attendees?.find((a) => a.userId === currentUser?.userId);

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

  const handleSaveMinutes = async () => {
    setSavingMinutes(true);
    try {
      const res = await api.meetings.saveMinutes(meeting.meetingId, {
        agenda: agendaText,
        summary: summaryText,
        keyDecisions: keyDecisionsText,
        publishedById: currentUser?.userId,
      });
      setMinutes(res);
      setIsEditingMinutes(false);
      toast.success("Minutes Published!", "Meeting minutes and executive summary have been recorded.");
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error("Save Failed", errorObj?.message || "Failed to save meeting minutes.");
    } finally {
      setSavingMinutes(false);
    }
  };

  const handleCreateActionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDescription.trim()) return;
    setSavingAction(true);
    try {
      const newItem = await api.meetings.createActionItem(meeting.meetingId, {
        taskDescription,
        assigneeId,
        dueDate: dueDate || undefined,
      });
      setActionItems((prev) => [...prev, newItem]);
      setTaskDescription("");
      setAssigneeId(undefined);
      setDueDate("");
      setShowAddAction(false);
      toast.success("Action Item Added", "Task assigned and recorded.");
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error("Failed to add task", errorObj?.message || "Could not save action item.");
    } finally {
      setSavingAction(false);
    }
  };

  const handleToggleActionStatus = async (item: ActionItem) => {
    const nextStatus: ActionItemStatus =
      item.status === "PENDING"
        ? "IN_PROGRESS"
        : item.status === "IN_PROGRESS"
        ? "COMPLETED"
        : "PENDING";

    try {
      const updated = await api.actionItems.updateStatus(item.itemId, nextStatus);
      setActionItems((prev) =>
        prev.map((i) => (i.itemId === item.itemId ? updated : i))
      );
      toast.success("Status Updated", `Task marked as ${nextStatus}`);
    } catch {
      toast.error("Update Failed", "Could not change task status.");
    }
  };

  const handleDeleteActionItem = async (itemId: number) => {
    try {
      await api.actionItems.delete(itemId);
      setActionItems((prev) => prev.filter((i) => i.itemId !== itemId));
      toast.success("Task Removed", "Action item deleted.");
    } catch {
      toast.error("Delete Failed", "Could not delete action item.");
    }
  };

  const handleCreateAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !fileUrl.trim()) return;
    setSavingAttachment(true);
    try {
      const newAtt = await api.meetings.addAttachment(meeting.meetingId, {
        fileName,
        fileUrl,
        fileType,
        uploadedById: currentUser?.userId,
      });
      setAttachments((prev) => [...prev, newAtt]);
      setFileName("");
      setFileUrl("");
      setShowAddAttachment(false);
      toast.success("Attachment Added", "Document linked to meeting.");
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error("Attachment Failed", errorObj?.message || "Could not attach document.");
    } finally {
      setSavingAttachment(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      await api.attachments.delete(attachmentId);
      setAttachments((prev) => prev.filter((a) => a.attachmentId !== attachmentId));
      toast.success("Attachment Removed", "File unlinked from meeting.");
    } catch {
      toast.error("Delete Failed", "Could not remove attachment.");
    }
  };

  const handleCheckIn = async () => {
    if (!meeting) return;
    setCheckingIn(true);
    try {
      const updated = await api.meetings.checkIn(meeting.meetingId);
      meeting.isCheckedIn = true;
      meeting.checkedInAt = updated.checkedInAt;
      toast.success("Check-In Confirmed", "Meeting room presence has been verified.");
      if (onCheckIn) onCheckIn(meeting.meetingId);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to record check-in.";
      toast.error("Check-In Error", errorMsg);
    } finally {
      setCheckingIn(false);
    }
  };

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
          {meeting.isCheckedIn ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Checked In
            </span>
          ) : meeting.status === "CONFIRMED" ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-3 h-3 text-amber-600" />
              Awaiting Check-in
            </span>
          ) : null}
          {meeting.seriesId && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              <CalendarCheck className="w-3 h-3" />
              Series #{meeting.seriesId}
            </span>
          )}
        </div>
      }
      maxWidth="3xl"
    >
      <div className="space-y-4 text-xs">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Overview & Room</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("minutes")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "minutes"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Minutes (MOM)</span>
            {minutes && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("actions")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "actions"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Action Items ({actionItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("attachments")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "attachments"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Attachments ({attachments.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-4 animate-in fade-in duration-150">
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
          </div>
        )}

        {/* TAB 2: MINUTES (MOM) */}
        {activeTab === "minutes" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Meeting Minutes (MOM) & Decisions
                </h3>
                <p className="text-[11px] text-slate-500">
                  Document agenda topics, executive summary, and agreed outcomes.
                </p>
              </div>

              {canManageProductivity && !isEditingMinutes && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingMinutes(true)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  className="h-7 text-xs"
                >
                  {minutes ? "Edit Minutes" : "Write Minutes"}
                </Button>
              )}
            </div>

            {isEditingMinutes ? (
              <div className="space-y-3 p-4 rounded-xl border border-indigo-200 bg-indigo-50/20">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Meeting Agenda
                  </label>
                  <textarea
                    rows={2}
                    value={agendaText}
                    onChange={(e) => setAgendaText(e.target.value)}
                    placeholder="Key discussion topics covered..."
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Executive Summary
                  </label>
                  <textarea
                    rows={3}
                    value={summaryText}
                    onChange={(e) => setSummaryText(e.target.value)}
                    placeholder="High-level overview of discussions and outcomes..."
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Key Decisions Made
                  </label>
                  <textarea
                    rows={3}
                    value={keyDecisionsText}
                    onChange={(e) => setKeyDecisionsText(e.target.value)}
                    placeholder="Enumerate key decisions agreed upon during this meeting..."
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800 bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingMinutes(false)}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSaveMinutes}
                    isLoading={savingMinutes}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    className="h-7 text-xs"
                  >
                    Publish Minutes
                  </Button>
                </div>
              </div>
            ) : minutes ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Executive Summary
                  </h4>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {minutes.summary || "No executive summary recorded."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Key Decisions
                  </h4>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                    {minutes.keyDecisions || "No specific key decisions logged."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Meeting Agenda
                  </h4>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {minutes.agenda || "Standard agenda."}
                  </p>
                </div>

                {minutes.publishedAt && (
                  <p className="text-[10px] text-slate-400 text-right">
                    Published on {new Date(minutes.publishedAt).toLocaleString()} by{" "}
                    <strong>{minutes.publishedBy?.name || "Organizer"}</strong>
                  </p>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">No Minutes Published Yet</p>
                <p className="text-[11px]">
                  Minutes can be recorded by the meeting organizer or an administrator.
                </p>
                {canManageProductivity && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setIsEditingMinutes(true)}
                    className="mt-2 text-xs"
                  >
                    Write Meeting Minutes
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACTION ITEMS */}
        {activeTab === "actions" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  Follow-up Action Items
                </h3>
                <p className="text-[11px] text-slate-500">
                  Assign post-meeting tasks, set due dates, and monitor progress.
                </p>
              </div>

              {canManageProductivity && !showAddAction && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddAction(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="h-7 text-xs"
                >
                  Add Task
                </Button>
              )}
            </div>

            {/* Add Action Item Form */}
            {showAddAction && (
              <form
                onSubmit={handleCreateActionItem}
                className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-3"
              >
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Task Description
                  </label>
                  <input
                    type="text"
                    required
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="e.g. Prepare revised financial model for Q4 review"
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Assignee
                    </label>
                    <select
                      value={assigneeId || ""}
                      onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800 bg-white"
                    >
                      <option value="">Unassigned</option>
                      {meeting.attendees?.map((a) => (
                        <option key={a.userId} value={a.userId}>
                          {a.name} ({a.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddAction(false)}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={savingAction}
                    className="h-7 text-xs"
                  >
                    Save Action Item
                  </Button>
                </div>
              </form>
            )}

            {/* Action Items List */}
            <div className="space-y-2">
              {actionItems.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 space-y-1">
                  <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-600">No Action Items Recorded</p>
                  <p className="text-[11px]">Keep projects moving by assigning follow-up tasks.</p>
                </div>
              ) : (
                actionItems.map((item) => (
                  <div
                    key={item.itemId}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleActionStatus(item)}
                        className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                          item.status === "COMPLETED"
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : item.status === "IN_PROGRESS"
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 hover:border-slate-400"
                        }`}
                        title="Click to cycle task status"
                      >
                        {item.status === "COMPLETED" && <Check className="w-3 h-3" />}
                        {item.status === "IN_PROGRESS" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </button>

                      <div className="min-w-0">
                        <p
                          className={`font-semibold text-slate-800 ${
                            item.status === "COMPLETED" ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {item.taskDescription}
                        </p>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                          {item.assignee && (
                            <span className="flex items-center gap-1 font-medium text-slate-600">
                              <UserIcon className="w-3 h-3 text-slate-400" />
                              {item.assignee.name}
                            </span>
                          )}
                          {item.dueDate && (
                            <span className="flex items-center gap-1 font-mono text-slate-500">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Due: {item.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        onClick={() => handleToggleActionStatus(item)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer select-none ${
                          item.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : item.status === "IN_PROGRESS"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {item.status}
                      </span>

                      {canManageProductivity && (
                        <button
                          type="button"
                          onClick={() => handleDeleteActionItem(item.itemId)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Action Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ATTACHMENTS */}
        {activeTab === "attachments" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-indigo-600" />
                  Meeting Documents & Slides
                </h3>
                <p className="text-[11px] text-slate-500">
                  Shared slide decks, spreadsheets, and conference materials.
                </p>
              </div>

              {canManageProductivity && !showAddAttachment && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddAttachment(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="h-7 text-xs"
                >
                  Add Document
                </Button>
              )}
            </div>

            {/* Add Attachment Form */}
            {showAddAttachment && (
              <form
                onSubmit={handleCreateAttachment}
                className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Document Title
                    </label>
                    <input
                      type="text"
                      required
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="e.g. Q4 Strategy Presentation.pdf"
                      className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Document Category
                    </label>
                    <select
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800 bg-white"
                    >
                      <option value="SLIDES">Presentation Slides</option>
                      <option value="DOCUMENT">Report / Agenda (PDF/DOC)</option>
                      <option value="SPREADSHEET">Financial / Spreadsheet</option>
                      <option value="LINK">Online Workspace Link</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Document URL or File Location
                  </label>
                  <input
                    type="text"
                    required
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://docs.company.internal/file or cloud storage URL"
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 text-slate-800 bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddAttachment(false)}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={savingAttachment}
                    className="h-7 text-xs"
                  >
                    Attach Document
                  </Button>
                </div>
              </form>
            )}

            {/* Attachments List */}
            <div className="space-y-2">
              {attachments.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 space-y-1">
                  <Paperclip className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-600">No Attachments Added</p>
                  <p className="text-[11px]">Upload or link meeting slide decks, agendas, or notes.</p>
                </div>
              ) : (
                attachments.map((att) => (
                  <div
                    key={att.attachmentId}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{att.fileName}</p>
                        <p className="text-[10px] text-slate-400">
                          {att.fileType || "DOCUMENT"} • Uploaded by {att.uploadedBy?.name || "Organizer"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open</span>
                      </a>

                      {canManageProductivity && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(att.attachmentId)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Attachment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {/* Quick Approve Button */}
            {isAdmin && meeting.status === "PENDING" && onApprove && (
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

            {/* Check-In Button */}
            {meeting.status === "CONFIRMED" && !meeting.isCheckedIn && (
              <Button
                variant="success"
                size="sm"
                type="button"
                onClick={handleCheckIn}
                disabled={checkingIn}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {checkingIn ? "Checking In..." : "Check In"}
              </Button>
            )}

            {/* Quick Cancel Button */}
            {(isAdmin || isOrganizer) &&
              (meeting.status === "PENDING" || meeting.status === "CONFIRMED") &&
              onRequestCancel && (
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

          <div className="flex items-center gap-2">
            <CalendarSyncDropdown
              meeting={meeting}
              locationName={meeting.room?.name}
              size="sm"
            />
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
      </div>
    </Modal>
  );
}

export default MeetingDetailsModal;
