"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Zap,
  Radio,
  Cpu,
  Layers,
} from "lucide-react";

export function LaunchPage() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative h-screen max-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* ========================================================= */}
      {/* 1. TECHNOLOGY BACKGROUND CANVAS                           */}
      {/* ========================================================= */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Interactive Mouse Spotlight Glow */}
        <div
          className="absolute inset-0 transition-opacity duration-300 opacity-80"
          style={{
            background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.12), transparent 70%)`,
          }}
        />

        {/* Ambient Radiant Glowing Orbs (Aurora Beam) */}
        <div
          className="absolute -top-36 left-1/2 -translate-x-1/2 w-[720px] h-[400px] bg-gradient-to-tr from-indigo-500/20 via-violet-500/15 to-sky-400/20 rounded-full blur-[110px] pointer-events-none animate-pulse"
          style={{ animationDuration: "7s" }}
        />
        <div className="absolute top-1/3 -left-32 w-[460px] h-[460px] bg-gradient-to-br from-indigo-400/15 to-cyan-400/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 -right-32 w-[500px] h-[500px] bg-gradient-to-tl from-violet-500/15 to-fuchsia-400/10 rounded-full blur-[130px] pointer-events-none" />

        {/* Cyber Geometric Tech Grid */}
        <div
          className="absolute inset-0 opacity-[0.55] dark:opacity-[0.28]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(99, 102, 241, 0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.12) 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 80% 65% at 50% 50%, #000 60%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 65% at 50% 50%, #000 60%, transparent 100%)",
          }}
        />

        {/* Fine Dot Matrix Overlay */}
        <div
          className="absolute inset-0 opacity-[0.3] dark:opacity-[0.18]"
          style={{
            backgroundImage: "radial-gradient(rgba(99, 102, 241, 0.35) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(ellipse 70% 55% at 50% 50%, #000 50%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 50%, #000 50%, transparent 100%)",
          }}
        />

        {/* Cyber Crosshairs & Tech Coordinates Markers */}
        <div className="absolute top-24 left-12 text-indigo-400/50 dark:text-indigo-300/30 select-none font-mono text-[10px] hidden md:block tracking-wider">
          <span>+ [SYS.GATEWAY: 0x8840]</span>
        </div>
        <div className="absolute top-28 right-16 text-indigo-400/50 dark:text-indigo-300/30 select-none font-mono text-[10px] hidden md:block tracking-wider">
          <span>+ [DISPATCH_ENGINE: ONLINE]</span>
        </div>
        <div className="absolute bottom-24 left-16 text-indigo-400/50 dark:text-indigo-300/30 select-none font-mono text-[10px] hidden md:block tracking-wider">
          <span>+ [API.LATENCY: &lt;10ms]</span>
        </div>
        <div className="absolute bottom-20 right-20 text-indigo-400/50 dark:text-indigo-300/30 select-none font-mono text-[10px] hidden md:block tracking-wider">
          <span>+ [SEC.HASH: SHA-256]</span>
        </div>

        {/* Ambient Subtle Tech Circuit Lines Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.2] dark:opacity-[0.12] text-indigo-600 dark:text-indigo-400 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="tech-circuit" width="220" height="220" patternUnits="userSpaceOnUse">
              <path
                d="M 0 110 L 80 110 L 110 80 L 180 80 L 220 110"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <circle cx="110" cy="80" r="3" fill="currentColor" opacity="0.6" />
              <circle cx="80" cy="110" r="2.5" fill="currentColor" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tech-circuit)" />
        </svg>
      </div>

      {/* ========================================================= */}
      {/* 2. TOP HEADER                                             */}
      {/* ========================================================= */}
      <header className="shrink-0 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xs z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-center p-1.5 overflow-hidden group hover:scale-105 transition-transform">
              <img
                src="/default logo/meeting-time.svg"
                alt="Meeting Management System Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  MeetingHub
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  MMS Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Centralized Room Booking & Facility Logistics
              </p>
            </div>
          </div>

          {/* Right Action: Sign In */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 3. MAIN HERO CONTENT AREA                                */}
      {/* ========================================================= */}
      <main className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-0 z-10">
        <div className="relative w-full max-w-3xl mx-auto">
          {/* Floating Telemetry Badge Left (Desktop) */}
          <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-indigo-900/5 backdrop-blur-md absolute top-1/2 -left-28 -translate-y-16 animate-in fade-in slide-in-from-left duration-500 pointer-events-none select-none">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Conflict Engine</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Zero Overlap Booking</p>
            </div>
          </div>

          {/* Floating Telemetry Badge Right (Desktop) */}
          <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/85 dark:bg-slate-900/85 border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-indigo-900/5 backdrop-blur-md absolute top-1/2 -right-28 translate-y-12 animate-in fade-in slide-in-from-right duration-500 pointer-events-none select-none">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Room Kiosks</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Live Status Sync</p>
            </div>
          </div>

          {/* Center Hero */}
          <section className="text-center space-y-5 sm:space-y-6 my-auto py-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200/90 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Official Launchpad & Technology Gateway</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Master Every Meeting. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 dark:from-indigo-400 dark:via-indigo-300 dark:to-violet-400">
                Zero Conflicts.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              Eliminate double-booking conflicts, automate equipment allocation, and coordinate support personnel seamlessly across all corporate conference rooms.
            </p>

            <div className="pt-2 flex flex-col items-center gap-3">
              <Link
                href="/login"
                className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>Sign In to Access MMS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Quick Tech Specs Strip */}
            <div className="pt-3 flex items-center justify-center gap-6 sm:gap-8 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Real-Time Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Smart Resource Logistics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <span>Enterprise RBAC</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ========================================================= */}
      {/* 4. FOOTER                                                 */}
      {/* ========================================================= */}
      <footer className="shrink-0 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl py-3.5 px-4 sm:px-6 lg:px-8 z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <img
              src="/default logo/meeting-time.svg"
              alt="MMS Logo"
              className="w-5 h-5 object-contain"
            />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Meeting Management System (MMS)
            </span>
            <span>•</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              Enterprise v1.5.0
            </span>
          </div>

          <div className="flex items-center gap-3 font-medium">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold">Systems Operational</span>
            </div>
            <span>•</span>
            <Link
              href="/login"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
