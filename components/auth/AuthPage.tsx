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
} from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/default logo/meeting-time.svg"
                alt="Meeting Management System Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                MeetingHub <span className="text-xs font-semibold text-indigo-600">MMS</span>
              </span>
              <p className="text-[11px] text-slate-500">Corporate Staff Access Gateway</p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Launchpad</span>
          </Link>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Card Container */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-8 shadow-xl shadow-slate-900/5 space-y-6">
            {/* Title & Badge */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <Lock className="w-3 h-3 text-indigo-600" />
                <span>Spring Security & JWT Protected</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Sign In to Your Workspace
              </h2>
              <p className="text-xs text-slate-500">
                Enter your registered corporate credentials to access your role workspace.
              </p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMsg}</div>
              </div>
            )}

            {/* SIGN IN FORM */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs text-slate-900 bg-white placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs text-slate-900 bg-white placeholder:text-slate-400 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 text-xs font-bold shadow-md shadow-indigo-600/20"
                isLoading={loading}
              >
                Sign In to Workspace
              </Button>

              {/* Internal Company Notice */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-semibold mb-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Company Internal System</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Accounts are provisioned by System Administrators. If you need access, please contact your administrator.
                </p>
              </div>

              {/* Quick Role Fill Presets */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  Quick Role Sign In Presets
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill("vibolsen2002@gmail.com", "Vibol@2020")}
                    className="p-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-left transition-colors cursor-pointer"
                  >
                    <span className="block text-[10px] font-bold text-indigo-700 uppercase">
                      Admin
                    </span>
                    <span className="block text-[10px] text-slate-600 truncate">Vibol SEN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill("organizer@meeting.com", "Organizer@2020")}
                    className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left transition-colors cursor-pointer"
                  >
                    <span className="block text-[10px] font-bold text-emerald-700 uppercase">
                      Organizer
                    </span>
                    <span className="block text-[10px] text-slate-600 truncate">Organizer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill("alice@meeting.com", "Alice@2020")}
                    className="p-2 rounded-xl border border-violet-200 bg-violet-50/70 hover:bg-violet-100 text-left transition-colors cursor-pointer"
                  >
                    <span className="block text-[10px] font-bold text-violet-700 uppercase">
                      Employee
                    </span>
                    <span className="block text-[10px] text-slate-600 truncate">Alice J.</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <span>Meeting Management System • Enterprise Security & Token Authentication</span>
      </footer>
    </div>
  );
}
