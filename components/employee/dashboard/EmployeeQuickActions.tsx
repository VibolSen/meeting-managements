"use client";

import React from "react";
import Link from "next/link";
import { Calendar, MailCheck, CalendarDays, Bell, ArrowRight } from "lucide-react";

export function EmployeeQuickActions() {
  const actions = [
    {
      title: "My Schedule & Agenda",
      description: "View day/week timetable & conference details",
      href: "/employee/my-schedule",
      icon: <Calendar className="w-4.5 h-4.5" />,
      color: "indigo",
    },
    {
      title: "Respond to Invitations",
      description: "Accept or decline pending meeting invites",
      href: "/employee/my-invitations",
      icon: <MailCheck className="w-4.5 h-4.5" />,
      color: "emerald",
    },
    {
      title: "Browse Room Schedule",
      description: "Check corporate room availability matrix",
      href: "/employee/room-schedule",
      icon: <CalendarDays className="w-4.5 h-4.5" />,
      color: "blue",
    },
    {
      title: "Notification Inbox",
      description: "Review meeting alerts & cancellation notices",
      href: "/employee/notifications",
      icon: <Bell className="w-4.5 h-4.5" />,
      color: "amber",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900">Quick Navigation</h3>
        <p className="text-[11px] text-slate-400">Direct shortcuts to your daily tools</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act) => (
          <Link
            key={act.title}
            href={act.href}
            className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between group bg-slate-50/40 hover:bg-white"
          >
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
              <span>Open tool</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default EmployeeQuickActions;
