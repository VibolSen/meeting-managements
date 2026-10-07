"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowLeft,
  AlertTriangle,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Cpu,
  Radio,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";
import { UserRole } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/Toast";

interface AuthPageProps {
  initialMode?: "signin" | "signup";
}

export function AuthPage({ initialMode = "signin" }: AuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const isLogout = searchParams.get("logout") === "true";
  const toast = useToast();
  const { login, logout, user: currentUser } = useAuth();

  // Interactive Technology Background Spotlight
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // If arriving via sign out, ensure local session is wiped
  useEffect(() => {
    if (isLogout) {
      logout();
    }
  }, [isLogout, logout]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Redirect if already logged in (and not logging out)
  useEffect(() => {
    if (currentUser && !isLogout) {
      handleRedirect(currentUser.role);
    }
  }, [currentUser, isLogout]);

  const handleRedirect = (role: UserRole) => {
    if (returnUrl) {
      router.push(returnUrl);
      return;
    }
    if (role === "ADMIN") {
      router.push("/admin/dashboard");
    } else if (role === "ORGANIZER") {
      router.push("/organizer/dashboard");
    } else {
      router.push("/employee/dashboard");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const loggedUser = await login({
        email: signInEmail.trim(),
        password: signInPassword,
      });
      toast.success("Welcome Back", `Signed in as ${loggedUser.name} (${loggedUser.role})`);
      handleRedirect(loggedUser.role);
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid email or password");
      toast.error("Authentication Failed", err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Autofill Helper
  const handleQuickFill = (email: string, pass: string) => {
    setSignInEmail(email);
    setSignInPassword(pass);
    setErrorMsg(null);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-600 selection:text-white overflow-hidden">
      {/* ========================================================= */}
      {/* TECHNOLOGY BACKGROUND CANVAS (From LaunchPad Architecture)*/}
      {/* ========================================================= */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Interactive Mouse Spotlight Glow */}
        <div
          className="absolute inset-0 transition-opacity duration-300 opacity-80"
          style={{
            background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.14), transparent 70%)`,
          }}
        />

        {/* Radiant Glowing Orbs (Aurora Beams) */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[760px] h-[420px] bg-gradient-to-tr from-indigo-500/20 via-violet-500/15 to-sky-400/20 rounded-full blur-[110px] pointer-events-none animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div className="absolute top-1/4 -left-36 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/15 to-cyan-400/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-5 -right-36 w-[540px] h-[540px] bg-gradient-to-tl from-violet-600/15 to-fuchsia-400/12 rounded-full blur-[140px] pointer-events-none" />

        {/* Cyber Geometric Tech Grid */}
        <div
          className="absolute inset-0 opacity-[0.55] dark:opacity-[0.28]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(99, 102, 241, 0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.12) 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 85% 70% at 50% 50%, #000 60%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 85% 70% at 50% 50%, #000 60%, transparent 100%)",
          }}
        />

        {/* Fine Dot Matrix Overlay */}
        <div
          className="absolute inset-0 opacity-[0.32] dark:opacity-[0.18]"
          style={{
            backgroundImage: "radial-gradient(rgba(99, 102, 241, 0.35) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(ellipse 75% 60% at 50% 50%, #000 50%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 75% 60% at 50% 50%, #000 50%, transparent 100%)",
          }}
        />

        {/* Cyber Crosshairs & Security Telemetry Markers */}
        <div className="absolute top-20 left-10 text-indigo-500/60 dark:text-indigo-300/40 select-none font-mono text-[10px] hidden md:block tracking-wider">
          <span>+ [SEC.GATEWAY: JWT_AUTH_v1.5]</span>
        </div>
        <div className="absolute top-24 right-12 text-indigo-500/60 dark:text-indigo-300/40 select-none font-mono text-[10px] hidden md:block tracking-wider">
          <span>+ [ENCRYPTION: AES_256_GCM]</span>
        </div>
        <div className="absolute bottom-20 left-12 text-indigo-500/60 dark:text-indigo-300/40 select-none font-mono text-[10px] hidden md:block tracking-wider">
          <span>+ [AUTH.PROTOCOL: BEARER_TOKEN]</span>
        </div>
        <div className="absolute bottom-16 right-16 text-indigo-500/60 dark:text-indigo-300/40 select-none font-mono text-[10px] hidden md:block tracking-wider">
          <span>+ [TLS.STATUS: ENCRYPTED_STREAM]</span>
        </div>

        {/* Subtle Tech Circuit Lines Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.22] dark:opacity-[0.12] text-indigo-600 dark:text-indigo-400 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="auth-tech-circuit" width="220" height="220" patternUnits="userSpaceOnUse">
              <path
                d="M 0 110 L 80 110 L 110 80 L 180 80 L 220 110"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <circle cx="80" cy="110" r="3" fill="currentColor" opacity="0.6" />
              <circle cx="180" cy="80" r="3" fill="currentColor" opacity="0.6" />
              <path
                d="M 110 0 L 110 50 L 140 80 L 140 160 L 110 190 L 110 220"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <circle cx="140" cy="80" r="3" fill="currentColor" opacity="0.6" />
              <circle cx="140" cy="160" r="3" fill="currentColor" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-tech-circuit)" />
        </svg>

        {/* Animated Floating Energy Beams */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent animate-pulse" />
        <div
          className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-violet-500/30 to-transparent animate-pulse"
          style={{ animationDelay: "2.5s" }}
        />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full border-b border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-xs flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/default logo/meeting-time.svg"
                alt="Meeting Management System Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  MeetingHub <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">MMS</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  v1.5.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Corporate Staff Access Gateway</p>
            </div>
          </Link>

          {/* Right Actions: Telemetry + Theme Toggle + Back Link */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live Security & Gateway Telemetry */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Operational</span>
              <span className="text-emerald-300 dark:text-emerald-700">•</span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">SSL Active</span>
            </div>

            {/* Dark / Light Theme Switcher */}
            <ThemeToggle />

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 shadow-2xs transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Launchpad</span>
            </Link>
          </div>
        </div>
        {/* Glowing Gradient Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-indigo-500/40 dark:via-indigo-400/30 to-transparent pointer-events-none" />
      </header>

      {/* Main Form Center */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Glassmorphic Cyber Card */}
          <div className="rounded-3xl border border-white/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl p-7 sm:p-8 shadow-2xl shadow-indigo-500/10 space-y-6">
            {/* Title & Badge */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/90 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Spring Security & JWT Protected</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Sign In to Your Workspace
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your registered corporate credentials to access your role workspace.
              </p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMsg}</div>
              </div>
            )}

            {/* SIGN IN FORM */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="admin@meeting.com or user@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs text-slate-900 dark:text-white bg-white/90 dark:bg-slate-800/90 placeholder:text-slate-400 outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs text-slate-900 dark:text-white bg-white/90 dark:bg-slate-800/90 placeholder:text-slate-400 outline-none transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 text-xs font-bold shadow-md shadow-indigo-600/25 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl active:scale-[0.99] transition-all"
                isLoading={loading}
              >
                Sign In to Workspace
              </Button>

              {/* Internal Company Notice */}
              <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-750 text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs font-semibold mb-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Company Internal System</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Accounts are provisioned by System Administrators. If you need access, please contact your administrator.
                </p>
              </div>

              {/* Quick Role Fill Presets */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  Quick Role Sign In Presets
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill("vibolsen2002@gmail.com", "Vibol@2020")}
                    className="p-2.5 rounded-xl border border-indigo-200/90 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-left transition-colors cursor-pointer group"
                  >
                    <span className="block text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                      Admin
                    </span>
                    <span className="block text-[10px] text-slate-600 dark:text-slate-400 truncate">Vibol SEN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill("organizer@meeting.com", "Organizer@2020")}
                    className="p-2.5 rounded-xl border border-emerald-200/90 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-left transition-colors cursor-pointer group"
                  >
                    <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                      Organizer
                    </span>
                    <span className="block text-[10px] text-slate-600 dark:text-slate-400 truncate">Organizer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill("alice@meeting.com", "Alice@2020")}
                    className="p-2.5 rounded-xl border border-violet-200/90 dark:border-violet-900/60 bg-violet-50/70 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-left transition-colors cursor-pointer group"
                  >
                    <span className="block text-[10px] font-bold text-violet-700 dark:text-violet-300 uppercase">
                      Employee
                    </span>
                    <span className="block text-[10px] text-slate-600 dark:text-slate-400 truncate">Alice J.</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Clean Glassmorphic Footer */}
      <footer className="relative z-10 border-t border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center gap-3">
        <span>Meeting Management System • Enterprise Security & Token Authentication</span>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">SSL / TLS 1.3 Active</span>
      </footer>
    </div>
  );
}
