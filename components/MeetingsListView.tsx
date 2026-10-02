"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Check,
  Ban,
  Eye,
  Plus,
  RefreshCw,
  Layers,
  Wrench,
  UserCheck,
  Building,
} from "lucide-react";
import { api, Meeting, User, MeetingStatus, AttendeeResponseStatus } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface MeetingsListViewProps {
  currentUser?: User | null;
  onNavigateToBooking?: () => void;
}

type FilterTab = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "MINE";

export function MeetingsListView({
  currentUser = null,
  onNavigateToBooking,
}: MeetingsListViewProps = {}) {
  const toast = useToast();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const effectiveUser = currentUser || authUser;

  const handleBooking = () => {
    if (onNavigateToBooking) {
      onNavigateToBooking();
    } else {
      router.push("/admin/dashboard?tab=booking");
    }
  };
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Load All Meetings
  const loadMeetings = async () => {
    setLoading(true);
    try {
      const data = await api.meetings.getAll();
      setMeetings(data);
    } catch {
      toast.error("Failed to load meetings", "Check backend server status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  // Admin Approval Action
  const handleApprove = async (meetingId: number) => {
    setActionLoading(true);
    try {
      await api.meetings.approve(meetingId);
      toast.success("Meeting Approved", "Boardroom reservation is confirmed.");
      setSelectedMeeting(null);
      await loadMeetings();
    } catch {
      toast.error("Approval Failed", "Could not approve the meeting.");
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Meeting Action (Restores inventory)
  const handleConfirmCancel = async () => {
    if (!selectedMeeting) return;
    setActionLoading(true);
    try {
      await api.meetings.cancel(selectedMeeting.meetingId, cancelReason);
      toast.success("Meeting Cancelled", "Equipment inventory stock has been restored.");
      setCancelModalOpen(false);
      setCancelReason("");
      setSelectedMeeting(null);
      await loadMeetings();
    } catch {
      toast.error("Cancellation Failed", "Could not cancel meeting.");
    } finally {
      setActionLoading(false);
    }
  };

  // RSVP Action
  const handleRSVP = async (meetingId: number, status: AttendeeResponseStatus) => {
    if (!currentUser) return;
    setActionLoading(true);
    try {
      await api.meetings.updateRSVP(meetingId, currentUser.userId, status);
      toast.success(
        status === "ACCEPTED" ? "RSVP Accepted" : "RSVP Declined",
        "Your response was saved."
      );
      if (selectedMeeting && selectedMeeting.meetingId === meetingId) {
        const updated = await api.meetings.getById(meetingId);
        setSelectedMeeting(updated);
      }
      await loadMeetings();
    } catch {
      toast.error("RSVP Failed", "Could not update your attendance.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      // Tab filter
      if (activeTab === "PENDING" && m.status !== "PENDING") return false;
      if (activeTab === "CONFIRMED" && m.status !== "CONFIRMED") return false;
      if (activeTab === "COMPLETED" && m.status !== "COMPLETED") return false;
      if (activeTab === "CANCELLED" && m.status !== "CANCELLED") return false;
      if (activeTab === "MINE") {
        const isOrganizer = m.organizer?.userId === currentUser?.userId;
        const isAttendee = m.attendees?.some((a) => a.userId === currentUser?.userId);
        if (!isOrganizer && !isAttendee) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = m.title?.toLowerCase().includes(query);
        const matchesRoom = m.room?.name?.toLowerCase().includes(query);
        const matchesOrganizer = m.organizer?.name?.toLowerCase().includes(query);
        const matchesPurpose = m.purpose?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesRoom && !matchesOrganizer && !matchesPurpose) {
          return false;
        }
      }

      return true;
    });
  }, [meetings, activeTab, searchQuery, currentUser]);

  // Pending Count for Badge
  const pendingCount = useMemo(() => {
    return meetings.filter((m) => m.status === "PENDING").length;
  }, [meetings]);

  const confirmedCount = useMemo(() => {
    return meetings.filter((m) => m.status === "CONFIRMED").length;
  }, [meetings]);

  const myMeetingsCount = useMemo(() => {
    if (!currentUser) return 0;
    return meetings.filter(
      (m) =>
        m.organizer?.userId === currentUser.userId ||
        m.attendees?.some((a) => a.userId === currentUser.userId)
    ).length;
  }, [meetings, currentUser]);

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

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Meetings & Approvals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track schedules, manage boardroom approvals, inspect logistics, and submit attendance RSVPs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMeetings}
            isLoading={loading}
            className="h-8.5 text-xs px-3"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleBooking}
            className="h-8.5 text-xs px-3 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 border border-slate-200">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
              activeTab === "ALL"
                ? "bg-white text-indigo-600 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
            }`}
          >
            All ({meetings.length})
          </button>

          <button
            onClick={() => setActiveTab("PENDING")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
              activeTab === "PENDING"
                ? "bg-white text-amber-600 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
            }`}
          >
            <span>Pending Approvals</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("CONFIRMED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
              activeTab === "CONFIRMED"
                ? "bg-white text-emerald-600 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
            }`}
          >
            Confirmed ({confirmedCount})
          </button>

          <button
            onClick={() => setActiveTab("MINE")}
            className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
              activeTab === "MINE"
                ? "bg-white text-violet-600 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
            }`}
          >
            My Meetings ({myMeetingsCount})
          </button>

          <button
            onClick={() => setActiveTab("CANCELLED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
              activeTab === "CANCELLED"
                ? "bg-white text-rose-600 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search meetings, rooms, organizers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Meetings List Feed */}
      {filteredMeetings.length === 0 ? (
        <Card className="p-12 text-center border-slate-200 bg-white">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No meetings found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No meetings matching "${searchQuery}". Try changing your search or filter.`
              : "No meetings found in this category. Schedule a meeting to get started."}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToBooking}
            className="mt-4 gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            Book a Meeting
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredMeetings.map((m) => {
            const startDateStr = m.startTime.replace("T", " ").slice(0, 16);
            const endDateStr = m.endTime.replace("T", " ").slice(11, 16);
            const isOrganizer = m.organizer?.userId === currentUser?.userId;
            const currentUserAttendee = m.attendees?.find((a) => a.userId === currentUser?.userId);

            return (
              <Card
                key={m.meetingId}
                className="p-5 border-slate-200 bg-white hover:border-indigo-300 transition-all group shadow-xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left Column: Meeting Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {getStatusBadge(m.status)}
                      <h3
                        onClick={() => setSelectedMeeting(m)}
                        className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {m.title}
                      </h3>
                      {isOrganizer && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold">
                          You organized
                        </span>
                      )}
                    </div>

                    {m.purpose && (
                      <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">
                        {m.purpose}
                      </p>
                    )}

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        {startDateStr} &rarr; {endDateStr}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <strong className="text-slate-800">{m.room?.name}</strong> ({m.room?.location})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {m.attendees?.length || 0} Attendees
                      </span>
                      {m.materials && m.materials.length > 0 && (
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Layers className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          {m.materials.length} Equipment items
                        </span>
                      )}
                      {m.staffAssignments && m.staffAssignments.length > 0 && (
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Wrench className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {m.staffAssignments.length} Staff assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* Admin Boardroom Approval Button */}
                    {currentUser?.role === "ADMIN" && m.status === "PENDING" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(m.meetingId)}
                        isLoading={actionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-xs gap-1.5 shadow-md shadow-emerald-600/20"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </Button>
                    )}

                    {/* Attendee Quick RSVP */}
                    {currentUserAttendee && m.status !== "CANCELLED" && (
                      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 uppercase font-bold px-1">
                          RSVP:
                        </span>
                        <button
                          onClick={() => handleRSVP(m.meetingId, "ACCEPTED")}
                          className={`px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            currentUserAttendee.responseStatus === "ACCEPTED"
                              ? "bg-emerald-600 text-white"
                              : "text-slate-600 hover:text-emerald-700"
                          }`}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRSVP(m.meetingId, "DECLINED")}
                          className={`px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            currentUserAttendee.responseStatus === "DECLINED"
                              ? "bg-rose-600 text-white"
                              : "text-slate-600 hover:text-rose-700"
                          }`}
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {/* View Details Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMeeting(m)}
                      className="text-xs text-slate-700 gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </Button>

                    {/* Cancel Meeting Button */}
                    {m.status !== "CANCELLED" &&
                      (currentUser?.role === "ADMIN" || isOrganizer) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMeeting(m);
                            setCancelModalOpen(true);
                          }}
                          className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 p-2"
                          title="Cancel Meeting and release reserved items"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </Button>
                      )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* FULL MEETING DETAILS MODAL */}
      <Modal
        isOpen={!!selectedMeeting && !cancelModalOpen}
        onClose={() => setSelectedMeeting(null)}
        title={selectedMeeting?.title || "Meeting Details"}
        description={selectedMeeting?.purpose || "Full session overview and logistics breakdown."}
        maxWidth="lg"
      >
        {selectedMeeting && (
          <div className="space-y-6">
            {/* Header Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Status</span>
                <div className="mt-1">{getStatusBadge(selectedMeeting.status)}</div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Timing</span>
                <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  {selectedMeeting.startTime.replace("T", " ").slice(0, 16)} &rarr;{" "}
                  {selectedMeeting.endTime.replace("T", " ").slice(11, 16)}
                </p>
              </div>
            </div>

            {/* Room & Organizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Room Facility
                </span>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-indigo-600" />
                  {selectedMeeting.room?.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedMeeting.room?.location} &bull; Capacity: {selectedMeeting.room?.capacity}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Organizer
                </span>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-violet-600" />
                  {selectedMeeting.organizer?.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedMeeting.organizer?.email} &bull; {selectedMeeting.organizer?.role}
                </p>
              </div>
            </div>

            {/* Attendees & RSVP statuses */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Invited Attendees ({selectedMeeting.attendees?.length || 0})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {selectedMeeting.attendees?.map((att) => (
                  <div
                    key={att.userId}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs shadow-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{att.name}</p>
                      <p className="text-[11px] text-slate-500">{att.email}</p>
                    </div>
                    <Badge
                      variant={
                        att.responseStatus === "ACCEPTED"
                          ? "confirmed"
                          : att.responseStatus === "DECLINED"
                          ? "cancelled"
                          : "pending"
                      }
                    >
                      {att.responseStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Materials & Logistics */}
            {selectedMeeting.materials && selectedMeeting.materials.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-600" />
                  Requested Equipment & Resources
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMeeting.materials.map((mat) => (
                    <span
                      key={mat.materialId}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 font-medium flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <strong>{mat.name}</strong> &times; {mat.quantityRequested}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Support Staff Assigned */}
            {selectedMeeting.staffAssignments && selectedMeeting.staffAssignments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  Assigned Support Personnel
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMeeting.staffAssignments.map((st) => (
                    <span
                      key={st.staffId}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-medium flex items-center gap-2"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <strong>{st.name}</strong> ({st.role})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {currentUser?.role === "ADMIN" && selectedMeeting.status === "PENDING" ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApprove(selectedMeeting.meetingId)}
                  isLoading={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-xs gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve Boardroom Reservation
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {selectedMeeting.status !== "CANCELLED" &&
                  (currentUser?.role === "ADMIN" ||
                    currentUser?.userId === selectedMeeting.organizer?.userId) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCancelModalOpen(true)}
                      className="text-xs border-rose-200 text-rose-700 hover:bg-rose-50 gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Cancel Meeting
                    </Button>
                  )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedMeeting(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* CANCEL MEETING CONFIRMATION MODAL */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Meeting Booking"
        description="Are you sure you want to cancel this meeting? All reserved equipment inventory will be immediately restored."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Cancellation Reason (Optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g., Client rescheduled, emergency conflicts..."
              className="w-full h-24 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 resize-none shadow-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              className="text-xs"
            >
              Back
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancel}
              isLoading={actionLoading}
              className="text-xs gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
