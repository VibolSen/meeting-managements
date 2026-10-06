"use client";

import React from "react";
import Link from "next/link";
import { Calendar, CalendarPlus, MailCheck, CalendarDays, Bell, ArrowRight, Lock } from "lucide-react";
import { User } from "@/lib/api";

interface EmployeeQuickActionsProps {
  currentUser?: User | null;
  onOpenBooking?: () => void;
}

export function EmployeeQuickActions({ currentUser, onOpenBooking }: EmployeeQuickActionsProps = {}) {
  const isViewOnly = currentUser?.bookingAccess === "VIEW_ONLY";

  const actions = [
    {
      title: isViewOnly ? "Book Meeting (Restricted)" : "Book New Meeting",
      description: isViewOnly
        ? "View-only probation mode active (restricted)"
        : "Reserve a room & schedule a team conference",
      href: "/employee/book-meeting",
      icon: isViewOnly ? <Lock className="w-4.5 h-4.5" /> : <CalendarPlus className="w-4.5 h-4.5" />,
      color: isViewOnly ? "amber" : "indigo",
      isBooking: true,
    },
    {
      title: "My Schedule & Agenda",
      description: "View day/week timetable & conference details",
      href: "/employee/my-schedule",
      icon: <Calendar className="w-4.5 h-4.5" />,
      color: "emerald",
      isBooking: false,
    },
    {
      title: "Respond to Invitations",
      description: "Accept or decline pending meeting invites",
      href: "/employee/my-invitations",
      icon: <MailCheck className="w-4.5 h-4.5" />,
      color: "emerald",
      isBooking: false,
    },
    {
      title: "Browse Room Schedule",
      description: "Check corporate room availability matrix",
      href: "/employee/room-schedule",
      icon: <CalendarDays className="w-4.5 h-4.5" />,
      color: "blue",
      isBooking: false,
    },
    {
      title: "Notification Inbox",
      description: "Review meeting alerts & cancellation notices",
      href: "/employee/notifications",
      icon: <Bell className="w-4.5 h-4.5" />,
      color: "amber",
      isBooking: false,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900">Quick Navigation</h3>
        <p className="text-[11px] text-slate-400">Direct shortcuts to your daily tools</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {actions.map((act) => {
          const content = (
            <>
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    act.color === "indigo"
                      ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                      : act.color === "emerald"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : act.color === "blue"
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "bg-amber-50 text-amber-600 border border-amber-100"
                  }`}
                >
                  {act.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {act.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">{act.description}</p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">
                <span>{act.isBooking ? "Open Wizard" : "Open tool"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </>
          );

          if (act.isBooking && onOpenBooking) {
            return (
              <button
                key={act.title}
                type="button"
                onClick={onOpenBooking}
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between group bg-slate-50/40 hover:bg-white cursor-pointer text-left w-full"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={act.title}
              href={act.href}
              className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between group bg-slate-50/40 hover:bg-white"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default EmployeeQuickActions;
