"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarPlus,
  CalendarDays,
  MailCheck,
  Briefcase,
  ArrowUpRight,
} from "lucide-react";

export function OrganizerQuickActions() {
  const actions = [
    {
      title: "Book Meeting",
      description: "Reserve room, equipment & staff with live conflict check",
      href: "/organizer/book-meeting",
      icon: <CalendarPlus className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50 text-indigo-700 border-indigo-100",
      accent: "hover:border-indigo-300",
    },
    {
      title: "Room Schedule",
      description: "Visual time-block room availability and calendar",
      href: "/organizer/room-schedule",
      icon: <CalendarDays className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50 text-indigo-700 border-indigo-100",
      accent: "hover:border-indigo-300",
    },
    {
      title: "My Invitations",
      description: "Review meeting invitations and submit your RSVP",
      href: "/organizer/my-invitations",
      icon: <MailCheck className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50 text-blue-700 border-blue-100",
      accent: "hover:border-blue-300",
    },
    {
      title: "Organized Meetings",
      description: "Manage, reschedule or cancel meetings you coordinate",
      href: "/organizer/my-meetings",
      icon: <Briefcase className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50 text-amber-700 border-amber-100",
      accent: "hover:border-amber-300",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Frequent workflows and meeting coordination tools
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act, idx) => (
          <Link
            key={idx}
            href={act.href}
            className={`p-3.5 rounded-xl border border-slate-200/90 transition-all duration-200 hover:shadow-xs group flex flex-col justify-between ${act.accent}`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border ${act.bg}`}
              >
                {act.icon}
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>

            <div className="mt-3">
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {act.title}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-normal line-clamp-2">
                {act.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default OrganizerQuickActions;
