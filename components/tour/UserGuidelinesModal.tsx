"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTour } from "./TourContext";
import {
  BookOpen,
  Search,
  Sparkles,
  X,
  ShieldCheck,
  Calendar,
  UserCheck,
  Boxes,
  BellRing,
  HelpCircle,
  ChevronDown,
  Layers,
  Send,
  Zap,
} from "lucide-react";

export function UserGuidelinesModal() {
  const { isGuidelinesOpen, closeGuidelines, startTour, guidelinesTab } = useTour();

  const [activeTab, setActiveTab] = useState<string>("handbooks");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (guidelinesTab) {
      setActiveTab(guidelinesTab);
    }
  }, [guidelinesTab]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isGuidelinesOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGuidelines();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGuidelinesOpen, closeGuidelines]);

  // Knowledge items
  const handbooks = useMemo(
    () => [
      {
        id: "admin",
        role: "Administrator",
        badge: "GOVERNANCE & AUDIT",
        icon: ShieldCheck,
        color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800",
        summary: "Complete governance over conference spaces, user accounts, Telegram bot alerts, and compliance audit logs.",
        keyPoints: [
          "Boardroom Approvals: High-capacity rooms (≥ 20 seats) automatically queue in PENDING status until an Admin reviews and approves them.",
          "Dynamic System Settings: Hot-swap workspace branding, lead reminder minutes, operating hours, and bot credentials without restarting the server.",
          "Facility Maintenance: Mark rooms UNDER_MAINTENANCE to prevent scheduling during equipment repair or deep cleaning.",
          "Compliance Audit Trail: Immutable activity log recording all creation, update, deletion, and permission changes with CSV export support.",
        ],
      },
      {
        id: "organizer",
        role: "Meeting Organizer",
        badge: "LOGISTICS & COORDINATION",
        icon: Calendar,
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
        summary: "Coordinate high-impact meetings with guaranteed zero room conflicts, material allocations, and support staff.",
        keyPoints: [
          "Zero Double-Bookings: The Booking Wizard validates microsecond intervals [StartTime, EndTime) and immediately highlights conflicting slots.",
          "Equipment & Refreshments: Reserve 4K projectors, digital whiteboards, speakerphones, and catering packs from available inventory.",
          "Support Personnel: Allocate technicians, receptionists, or facilitators with conflict-free availability verification.",
          "Collaborative Minutes: Document executive meeting agendas, markdown minutes, and assign trackable action items to participants.",
        ],
      },
      {
        id: "employee",
        role: "Standard Employee",
        badge: "ATTENDEE & AGENDAS",
        icon: UserCheck,
        color: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800",
        summary: "Manage daily schedules, respond to invitations with one click, and inspect company room availability.",
        keyPoints: [
          "Personalized Itinerary: Access upcoming meetings, room locations, organizers, and scheduled start times in real-time.",
          "One-Click RSVP: Accept or decline invitations instantly from your employee portal or via Telegram alerts.",
          "Room Availability Browser: Check vacant room time slots before proposing team syncs or one-on-one sessions.",
          "Instant Alerts: Receive countdown reminders 15 minutes before meeting commencement.",
        ],
      },
    ],
    []
  );

  const systemRules = useMemo(
    () => [
      {
        title: "Microsecond Conflict Avoidance Engine",
        icon: Zap,
        description:
          "The backend executes JPQL interval intersection queries: (startTime < existingEnd AND endTime > existingStart). Any overlapping reservation for the same room triggers an immediate 409 Conflict, ensuring double-bookings are mathematically impossible.",
      },
      {
        title: "Boardroom Capacity Approval Gate",
        icon: ShieldCheck,
        description:
          "Rooms configured with capacity ≥ 20 seats (e.g., Executive Boardroom, Innovation Lab) route to PENDING approval to protect premium company facilities from casual over-booking. Standard rooms (< 20 seats) are auto-confirmed immediately.",
      },
      {
        title: "Atomic Inventory Reservation & Auto-Restocking",
        icon: Boxes,
        description:
          "When a meeting requests supplies (projectors, microphones, catering), available stock is atomically decremented upon booking. If the meeting is subsequently cancelled, reserved materials are immediately restored to the active inventory pool.",
      },
      {
        title: "Telegram Bot Integration & Channel Alerts",
        icon: Send,
        description:
          "The system interfaces with @MMS_Meeting_Alert_Bot. Admins can verify tokens and chat channel IDs dynamically in UI Settings. Attendees receive instant notifications for confirmations, cancellations, and pre-meeting reminder pings.",
      },
    ],
    []
  );

  const faqs = useMemo(
    () => [
      {
        q: "Why is my room booking pending approval instead of confirmed?",
        a: "Conference halls with capacity of 20 or more attendees require administrative sign-off to ensure optimal facility logistics. An administrator can approve the request from the Meetings & Approvals hub.",
      },
      {
        q: "How does the system prevent room double-bookings?",
        a: "Both the frontend Booking Wizard and the Spring Boot backend run active interval validation against all non-cancelled meetings. If another meeting overlaps by even one minute, the system prevents submission and alerts the user.",
      },
      {
        q: "What happens to reserved equipment if a meeting is cancelled?",
        a: "All reserved materials, equipment, and catering quantities are immediately released back to the general inventory pool so other organizers can utilize them.",
      },
      {
        q: "How do I configure or test the Telegram Bot alerts?",
        a: "Navigate to Settings -> Notifications & Alerts (as an Admin). Enter your Bot Token, Username, and Default Chat ID, click 'Verify Bot Token' to test live connectivity, and send a test message.",
      },
      {
        q: "Can I switch between Dark and Light mode without refreshing?",
        a: "Yes! Click the Theme Toggle in the top header. The theme updates instantly with zero page flash and persists across all portals.",
      },
    ],
    []
  );

  // Filtered lists based on search
  const filteredHandbooks = useMemo(() => {
    if (!searchQuery.trim()) return handbooks;
    const q = searchQuery.toLowerCase();
    return handbooks.filter(
      (h) =>
        h.role.toLowerCase().includes(q) ||
        h.summary.toLowerCase().includes(q) ||
        h.keyPoints.some((p) => p.toLowerCase().includes(q))
    );
  }, [handbooks, searchQuery]);

  const filteredRules = useMemo(() => {
    if (!searchQuery.trim()) return systemRules;
    const q = searchQuery.toLowerCase();
    return systemRules.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [systemRules, searchQuery]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(
      (f) =>
        f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [faqs, searchQuery]);

  if (!isGuidelinesOpen) return null;

  return (
    <div className="fixed inset-0 z-[9980] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  MMS Knowledge Center & Guidelines
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  v1.5.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Operational playbooks, facility policies, and interactive guidance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                closeGuidelines();
                startTour();
              }}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Take Interactive Tour</span>
            </button>

            <button
              type="button"
              onClick={closeGuidelines}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Manual"
              aria-label="Close Manual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar + Tabs Bar */}
        <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("handbooks")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "handbooks"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Role Handbooks</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("architecture")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "architecture"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>System Rules</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("faqs")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "faqs"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQs</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter topics & rules..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Role Handbooks */}
          {activeTab === "handbooks" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {filteredHandbooks.map((handbook) => {
                const Icon = handbook.icon;
                return (
                  <div
                    key={handbook.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center ${handbook.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {handbook.badge}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                        {handbook.role}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                        {handbook.summary}
                      </p>

                      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {handbook.keyPoints.map((point, pIdx) => (
                          <div key={pIdx} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          closeGuidelines();
                          startTour(handbook.id.toUpperCase() as any);
                        }}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/80 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Take {handbook.role} Tour</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: System Rules */}
          {activeTab === "architecture" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRules.map((rule, idx) => {
                const Icon = rule.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {rule.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-10.5">
                      {rule.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: FAQs */}
          {activeTab === "faqs" && (
            <div className="space-y-3">
              {filteredFaqs.map((faq, fIdx) => (
                <div
                  key={fIdx}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaqIndex(openFaqIndex === fIdx ? null : fIdx)
                    }
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>{faq.q}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        openFaqIndex === fIdx ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openFaqIndex === fIdx && (
                    <div className="px-5 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <BellRing className="w-3.5 h-3.5 text-indigo-500" />
            <span>Need more help? Contact IT at <strong>admin@meeting.com</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                closeGuidelines();
                startTour();
              }}
              className="inline-flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tour</span>
            </button>
            <button
              type="button"
              onClick={closeGuidelines}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
