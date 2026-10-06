"use client";

import React, { useState, useEffect, useCallback, use, useMemo } from "react";
import {
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Maximize2,
  Minimize2,
  Wrench,
  Calendar,
  Zap,
  LogOut,
  X,
  Send,
  Building2,
  Info,
} from "lucide-react";
import {
  api,
  RoomDisplayStatus,
  RoomIssueCategory,
  IssuePriority,
  Meeting,
} from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";

export default function RoomDisplayPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const resolvedParams = use(params);
  const roomId = Number(resolvedParams.roomId);
  const toast = useToast();
  const { user } = useAuth();

  const [data, setData] = useState<RoomDisplayStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modals state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showQuickBookModal, setShowQuickBookModal] = useState(false);
  const [quickBookMinutes, setQuickBookMinutes] = useState(15);
  const [quickBookTitle, setQuickBookTitle] = useState("Ad-hoc Team Sync");
  const [showEndEarlyModal, setShowEndEarlyModal] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Issue reporting form state
  const [issueCategory, setIssueCategory] =
    useState<RoomIssueCategory>("PROJECTOR_DISPLAY");
  const [issuePriority, setIssuePriority] = useState<IssuePriority>("MEDIUM");
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [reporterName, setReporterName] = useState("");

  // Fetch telemetry from backend
  const fetchTelemetry = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await api.rooms.getDisplayStatus(roomId);
      setData(res);
      setError(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load room status";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Periodic polling every 15s
  useEffect(() => {
    fetchTelemetry();
    const pollTimer = setInterval(fetchTelemetry, 15000);
    return () => clearInterval(pollTimer);
  }, [fetchTelemetry]);

  // Live second clock
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Check-In handler
  const handleCheckIn = async (meetingId: number) => {
    setSubmittingAction(true);
    try {
      await api.meetings.checkIn(meetingId);
      toast.success(
        "Check-In Confirmed",
        "Your room presence has been recorded."
      );
      await fetchTelemetry();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Check-in failed.";
      toast.error("Check-in Error", msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  // End Early handler
  const handleEndEarly = async (meetingId: number) => {
    setSubmittingAction(true);
    try {
      await api.meetings.endEarly(meetingId);
      toast.success(
        "Room Released",
        "Meeting concluded early. Space is now available."
      );
      setShowEndEarlyModal(false);
      await fetchTelemetry();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not release room.";
      toast.error("Action Failed", msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Quick Book handler
  const handleQuickBook = async () => {
    if (!data?.room) return;
    setSubmittingAction(true);
    try {
      const start = new Date();
      const end = new Date(start.getTime() + quickBookMinutes * 60000);

      const organizerId = user?.userId || 1; // current user or default system admin

      await api.meetings.create({
        title: quickBookTitle.trim() || `Ad-hoc Meeting (${quickBookMinutes}m)`,
        purpose: "Instant ad-hoc booking created directly from door tablet display",
        roomId: data.room.roomId,
        organizerId: organizerId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });

      toast.success("Room Booked", `Reserved for ${quickBookMinutes} minutes.`);
      setShowQuickBookModal(false);
      await fetchTelemetry();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Booking conflict or error.";
      toast.error("Quick Book Failed", msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Submit Issue Ticket
  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle.trim() || !data?.room) return;

    setSubmittingAction(true);
    try {
      await api.issues.report(
        data.room.roomId,
        {
          category: issueCategory,
          priority: issuePriority,
          title: issueTitle.trim(),
          description: issueDescription.trim(),
          reporterName: reporterName.trim() || user?.name || "Tablet Kiosk",
          reportedById: user?.userId,
        },
        user?.userId
      );

      toast.success(
        "Issue Reported",
        "Facility team alerted via Telegram and priority queue."
      );
      setShowIssueModal(false);
      setIssueTitle("");
      setIssueDescription("");
      await fetchTelemetry();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to report issue.";
      toast.error("Submission Error", msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Active meeting countdown computation
  const currentMeeting = data?.currentMeeting;
  const isOccupied = Boolean(data?.isOccupied && currentMeeting);

  const countdownText = useMemo(() => {
    if (!currentMeeting) return null;
    const end = new Date(currentMeeting.endTime).getTime();
    const now = currentTime.getTime();
    const diffSec = Math.max(0, Math.floor((end - now) / 1000));

    const minutes = Math.floor(diffSec / 60);
    const seconds = diffSec % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [currentMeeting, currentTime]);

  const meetingProgressPct = useMemo(() => {
    if (!currentMeeting) return 0;
    const start = new Date(currentMeeting.startTime).getTime();
    const end = new Date(currentMeeting.endTime).getTime();
    const now = currentTime.getTime();
    const total = end - start;
    if (total <= 0) return 100;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }, [currentMeeting, currentTime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium tracking-wide">
          Connecting to Smart Room Display Telemetry...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-rose-500 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-100">
          Display Telemetry Unavailable
        </h2>
        <p className="text-slate-400 max-w-md">
          {error || "Could not retrieve room status for Room ID: " + roomId}
        </p>
        <button
          onClick={fetchTelemetry}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold cursor-pointer transition-colors shadow-lg"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const room = data.room;
  const nextMeeting = data.nextMeeting;
  const isCheckedIn = Boolean(currentMeeting?.isCheckedIn);

  return (
    <div
      className={`min-h-screen ${
        isOccupied ? "bg-slate-950" : "bg-slate-950"
      } text-white font-sans flex flex-col justify-between overflow-hidden relative select-none p-6 md:p-10 transition-colors duration-700`}
      style={{
        backgroundImage: isOccupied
          ? "radial-gradient(ellipse at top left, rgba(225, 29, 72, 0.15), transparent 50%), radial-gradient(ellipse at bottom right, rgba(15, 23, 42, 0.9), transparent 70%)"
          : "radial-gradient(ellipse at top left, rgba(16, 185, 129, 0.15), transparent 50%), radial-gradient(ellipse at bottom right, rgba(15, 23, 42, 0.9), transparent 70%)",
      }}
    >
      {/* TOP HEADER BAR */}
      <header className="flex items-center justify-between z-10 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border ${
              isOccupied
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}
          >
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                {room.name}
              </h1>
              {data.activeIssues.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  <Wrench className="w-3.5 h-3.5" />
                  {data.activeIssues.length} Active Issue
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 flex items-center gap-3 mt-1">
              <span>📍 {room.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" /> Max Capacity:{" "}
                <strong className="text-slate-200">{room.capacity}</strong>
              </span>
            </p>
          </div>
        </div>

        {/* CLOCK & ACTIONS */}
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-3xl md:text-4xl font-black font-mono tracking-tight text-slate-100">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
            <div className="text-xs font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
              {currentTime.toLocaleDateString([], {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pl-4 border-l border-slate-800">
            <button
              onClick={() => setShowIssueModal(true)}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all cursor-pointer shadow-xs"
              title="Report Room Issue"
            >
              <Wrench className="w-5 h-5 text-amber-400" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all cursor-pointer shadow-xs"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* CENTER STAGE */}
      <main className="my-auto py-8 z-10 flex flex-col items-center justify-center text-center">
        {isOccupied && currentMeeting ? (
          /* OCCUPIED VIEW */
          <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-500">
            {/* Occupied Badge */}
            <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 shadow-xl shadow-rose-950/40">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-sm md:text-base font-extrabold uppercase tracking-widest">
                Room In Use • Occupied
              </span>
            </div>

            {/* Giant Countdown Clock */}
            <div className="space-y-3">
              <div className="text-7xl md:text-9xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_35px_rgba(244,63,94,0.35)]">
                {countdownText}
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-rose-300/80">
                Time Remaining Until Free
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-xl mx-auto h-2.5 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${meetingProgressPct}%` }}
                />
              </div>
            </div>

            {/* Active Meeting Card */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl max-w-2xl mx-auto text-left space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                  Current Session
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                  {currentMeeting.title}
                </h2>
                {currentMeeting.purpose && (
                  <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                    {currentMeeting.purpose}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center font-bold text-indigo-300">
                    {currentMeeting.organizer?.name?.[0] || "O"}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {currentMeeting.organizer?.name}
                    </div>
                    <div className="text-xs text-slate-400">Meeting Organizer</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    {currentMeeting.attendees?.length || 0} Attendees
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {/* Check-In Button */}
              {isCheckedIn ? (
                <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-sm shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Presence Confirmed & Checked In
                </div>
              ) : (
                <button
                  onClick={() => handleCheckIn(currentMeeting.meetingId)}
                  disabled={submittingAction}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-xl shadow-emerald-950/60 cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-emerald-400/40 animate-pulse"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {submittingAction ? "Verifying..." : "Tap to Check In Room"}
                </button>
              )}

              {/* End Meeting Early Button */}
              <button
                onClick={() => setShowEndEarlyModal(true)}
                disabled={submittingAction}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 font-bold text-sm transition-all cursor-pointer shadow-lg"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                Finish Early & Release Room
              </button>
            </div>
          </div>
        ) : (
          /* AVAILABLE VIEW */
          <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-500">
            {/* Available Badge */}
            <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-xl shadow-emerald-950/40">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-sm md:text-base font-extrabold uppercase tracking-widest">
                Available • Ready to Book
              </span>
            </div>

            {/* Giant Title */}
            <div className="space-y-3">
              <h2 className="text-6xl md:text-8xl font-black tracking-tight text-white drop-shadow-[0_0_35px_rgba(16,185,129,0.35)]">
                ROOM FREE
              </h2>
              <p className="text-base md:text-lg text-slate-300 max-w-xl mx-auto font-medium">
                {nextMeeting ? (
                  <>
                    Next reservation:{" "}
                    <strong className="text-emerald-300 font-bold">
                      &apos;{nextMeeting.title}&apos;
                    </strong>{" "}
                    at{" "}
                    <span className="font-mono text-white">
                      {new Date(nextMeeting.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>{" "}
                    {data.minutesUntilNextMeeting !== null && (
                      <span className="text-slate-400">
                        (in {data.minutesUntilNextMeeting} mins)
                      </span>
                    )}
                  </>
                ) : (
                  "No further reservations scheduled for today. Room is fully free."
                )}
              </p>
            </div>

            {/* Instant Quick-Book Action Card */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl max-w-2xl mx-auto space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Zap className="w-4 h-4" />
                  Instant Ad-hoc Reservation
                </div>
                <span className="text-xs text-slate-400">
                  Tap to reserve instantly
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[15, 30, 45].map((mins) => {
                  const isBlocked =
                    data.minutesUntilNextMeeting !== null &&
                    data.minutesUntilNextMeeting !== undefined &&
                    data.minutesUntilNextMeeting < mins;

                  return (
                    <button
                      key={mins}
                      disabled={isBlocked || submittingAction}
                      onClick={() => {
                        setQuickBookMinutes(mins);
                        setQuickBookTitle(`Instant Sync (${mins}m)`);
                        setShowQuickBookModal(true);
                      }}
                      className={`p-5 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all cursor-pointer shadow-lg ${
                        isBlocked
                          ? "bg-slate-950/40 border-slate-800/40 text-slate-600 cursor-not-allowed opacity-50"
                          : "bg-gradient-to-b from-indigo-950/50 to-slate-900 border-indigo-500/30 text-white hover:border-indigo-400 hover:scale-[1.03] active:scale-[0.98]"
                      }`}
                    >
                      <Sparkles className="w-6 h-6 text-indigo-400" />
                      <span className="text-2xl font-black font-mono">
                        {mins}m
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {isBlocked ? "Time Blocked" : "Quick Book"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM TIMELINE SCHEDULE STRIP */}
      <footer className="z-10 border-t border-slate-800/80 pt-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>TODAY&apos;S RESERVATION STRIP (08:00 – 18:00)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Active Now
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Scheduled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Completed
            </span>
          </div>
        </div>

        {/* Visual Strip Bar */}
        <div className="relative w-full h-10 bg-slate-900/90 rounded-xl border border-slate-800/90 overflow-hidden flex items-center">
          {data.todaySchedule.length === 0 ? (
            <div className="w-full text-center text-xs text-slate-500 font-medium">
              No meetings scheduled for this room today
            </div>
          ) : (
            data.todaySchedule.map((m: Meeting) => {
              const startHour =
                new Date(m.startTime).getHours() +
                new Date(m.startTime).getMinutes() / 60;
              const endHour =
                new Date(m.endTime).getHours() +
                new Date(m.endTime).getMinutes() / 60;

              // Timeline range 08:00 to 18:00 (10 hours total)
              const minHour = 8;
              const maxHour = 18;
              const totalHours = maxHour - minHour;

              const leftPct = Math.max(
                0,
                Math.min(100, ((startHour - minHour) / totalHours) * 100)
              );
              const widthPct = Math.max(
                2,
                Math.min(100 - leftPct, ((endHour - startHour) / totalHours) * 100)
              );

              const isActive =
                m.meetingId === currentMeeting?.meetingId && isOccupied;
              const isPast =
                new Date(m.endTime).getTime() < currentTime.getTime();

              return (
                <div
                  key={m.meetingId}
                  title={`${m.title} (${new Date(
                    m.startTime
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} - ${new Date(m.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })})`}
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                  }}
                  className={`absolute h-7 rounded-lg text-[10px] font-bold px-2 flex items-center justify-between truncate cursor-pointer transition-all ${
                    isActive
                      ? "bg-rose-500 text-white shadow-md shadow-rose-950 border border-rose-300"
                      : isPast
                      ? "bg-slate-700/80 text-slate-400 border border-slate-600/40"
                      : "bg-indigo-600/90 hover:bg-indigo-500 text-white border border-indigo-400/40"
                  }`}
                >
                  <span className="truncate">{m.title}</span>
                </div>
              );
            })
          )}

          {/* Current Time Needle */}
          {(() => {
            const currentHour =
              currentTime.getHours() + currentTime.getMinutes() / 60;
            if (currentHour >= 8 && currentHour <= 18) {
              const needleLeft = ((currentHour - 8) / 10) * 100;
              return (
                <div
                  style={{ left: `${needleLeft}%` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-20 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                  title="Current Time Needle"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400 -ml-[3px] -mt-1 shadow" />
                </div>
              );
            }
            return null;
          })()}
        </div>
      </footer>

      {/* QUICK BOOK MODAL */}
      {showQuickBookModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Instant {quickBookMinutes}-Min Booking
                  </h3>
                  <p className="text-xs text-slate-400">
                    Room: {room.name} ({room.location})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickBookModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={quickBookTitle}
                  onChange={(e) => setQuickBookTitle(e.target.value)}
                  placeholder="e.g. Quick Standup / Private Call"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-medium"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Start Time:</span>
                  <strong className="text-slate-200">
                    {currentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <strong className="text-indigo-400">
                    {quickBookMinutes} Minutes
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowQuickBookModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuickBook}
                disabled={submittingAction}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950 cursor-pointer transition-all"
              >
                {submittingAction ? "Confirming..." : "Confirm & Reserve Space"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* END EARLY MODAL */}
      {showEndEarlyModal && currentMeeting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Finish Meeting Early?
                </h3>
                <p className="text-xs text-slate-400">
                  Release room back to public availability
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to end{" "}
              <strong className="text-white">&apos;{currentMeeting.title}&apos;</strong> now?
              The room status will immediately flip to Available so teammates
              can use it.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEndEarlyModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={() => handleEndEarly(currentMeeting.meetingId)}
                disabled={submittingAction}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950 cursor-pointer transition-all"
              >
                {submittingAction ? "Releasing..." : "Yes, Release Room"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT ISSUE MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Report Room Equipment Issue
                  </h3>
                  <p className="text-xs text-slate-400">
                    Room: {room.name} ({room.location})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIssue} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Issue Category
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(
                    [
                      { id: "PROJECTOR_DISPLAY", label: "Projector / Screen" },
                      { id: "VIDEO_CONFERENCE", label: "Video Conference" },
                      { id: "AIR_CONDITIONING", label: "Air Conditioning" },
                      { id: "LIGHTING", label: "Lighting" },
                      { id: "CLEANLINESS", label: "Cleanliness" },
                      { id: "AUDIO_MIC", label: "Audio / Microphones" },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setIssueCategory(cat.id)}
                      className={`px-3 py-2 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                        issueCategory === cat.id
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(["LOW", "MEDIUM", "HIGH"] as const).map((pri) => (
                    <button
                      key={pri}
                      type="button"
                      onClick={() => setIssuePriority(pri)}
                      className={`px-3 py-2 rounded-xl border text-center font-bold uppercase transition-all cursor-pointer ${
                        issuePriority === pri
                          ? pri === "HIGH"
                            ? "bg-rose-500/20 border-rose-500 text-rose-300"
                            : "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {pri}
                    </button>
                  ))}
                </div>
                {issuePriority === "HIGH" && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                    <Info className="w-3.5 h-3.5" /> High priority flags room as
                    Under Maintenance immediately.
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Issue Summary
                </label>
                <input
                  type="text"
                  required
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="e.g. HDMI cable missing or display flickering"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Provide additional details to help the maintenance technician..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Reporter Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder={user?.name || "e.g. John Doe"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction || !issueTitle.trim()}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingAction ? "Sending Alert..." : "Dispatch Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
