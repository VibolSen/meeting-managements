"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export function LaunchPage() {
  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Header (Fixed Height, Non-collapsible) */}
      <header className="shrink-0 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xs z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center p-1.5 overflow-hidden">
              <img
                src="/default logo/meeting-time.svg"
                alt="Meeting Management System Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  MeetingHub
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  MMS Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Centralized Room Booking & Facility Logistics
              </p>
            </div>
          </div>

          {/* Right Action: Sign In Only */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area (Vertically Centered, No Scroll) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-0">
        <section className="text-center max-w-3xl mx-auto space-y-5 sm:space-y-6 my-auto py-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Official Launchpad & Portal Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Master Every Meeting. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
              Zero Conflicts.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Eliminate double-booking conflicts, automate equipment allocation, and coordinate support personnel seamlessly across all corporate conference rooms.
          </p>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-0.5 transition-all"
            >
              <ShieldCheck className="w-4.5 h-4.5" />
              <span>Sign In to Access MMS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer (Fixed Height, Compact) */}
      <footer className="shrink-0 border-t border-slate-200 bg-white py-4 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img
              src="/default logo/meeting-time.svg"
              alt="MMS Logo"
              className="w-5 h-5 object-contain"
            />
            <span className="font-semibold text-slate-700">
              Meeting Management System (MMS)
            </span>
            <span>•</span>
            <span>Enterprise Edition</span>
          </div>

          <div className="flex items-center gap-3 font-medium">
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors font-semibold">
              Sign In
            </Link>
            <span>•</span>
            <span className="text-slate-400">Security & Governance Gateway</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
