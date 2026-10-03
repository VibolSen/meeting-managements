"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Briefcase,
  Users,
  Building,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api, Department, UserRole } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/Toast";

interface AuthPageProps {
  initialMode?: "signin" | "signup";
}

export function AuthPage({ initialMode = "signin" }: AuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const toast = useToast();
  const { login, register, user: currentUser } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpRole, setSignUpRole] = useState<UserRole>("ORGANIZER");
  const [signUpDepartmentId, setSignUpDepartmentId] = useState<number | undefined>(undefined);

  // Load departments dynamically from backend API
  useEffect(() => {
    api.departments
      .getAll()
      .then((data) => {
        setDepartments(data || []);
        if (data && data.length > 0) {
          setSignUpDepartmentId(data[0].departmentId);
        }
      })
      .catch(() => setDepartments([]));
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      handleRedirect(currentUser.role);
    }
  }, [currentUser]);

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
      router.push("/portal");
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const newUser = await register({
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
        role: signUpRole,
        departmentId: signUpDepartmentId,
      });
      toast.success("Account Created", `Registered and logged in as ${newUser.name}`);
      handleRedirect(newUser.role);
    } catch (err: any) {
      setErrorMsg(err?.message || "Registration failed. Please check form values.");
      toast.error("Registration Failed", err?.message || "Could not register account");
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
              <p className="text-[11px] text-slate-500">Security & Access Gateway</p>
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
            {/* Title & Tabs */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <Lock className="w-3 h-3 text-indigo-600" />
                <span>Spring Security & JWT Protected</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {mode === "signin" ? "Sign In to Your Workspace" : "Create MMS Account"}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === "signin"
                  ? "Enter your registered credentials to access your role workspace"
                  : "Register with your corporate email and role authorization"}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="p-1 rounded-2xl bg-slate-100 flex items-center">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === "signin"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === "signup"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMsg}</div>
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === "signin" && (
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
            )}

            {/* SIGN UP FORM */}
            {mode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs text-slate-900 bg-white placeholder:text-slate-400 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="john.doe@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs text-slate-900 bg-white placeholder:text-slate-400 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Set Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="At least 6 characters"
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Role
                    </label>
                    <select
                      value={signUpRole}
                      onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:border-indigo-500 outline-none"
                    >
                      <option value="ORGANIZER">ORGANIZER</option>
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Department
                    </label>
                    <select
                      value={signUpDepartmentId || ""}
                      onChange={(e) => setSignUpDepartmentId(Number(e.target.value) || undefined)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:border-indigo-500 outline-none"
                    >
                      {departments.map((d) => (
                        <option key={d.departmentId} value={d.departmentId}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-2.5 text-xs font-bold shadow-md shadow-indigo-600/20 mt-2"
                  isLoading={loading}
                >
                  Create & Activate Account
                </Button>
              </form>
            )}
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
