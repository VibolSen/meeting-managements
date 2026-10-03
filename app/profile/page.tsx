import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { ProfileView } from "@/components/profile/ProfileView";

export const metadata = {
  title: "User Profile & Roles | Meeting Management System",
  description: "Unified profile overview, credentials, and role-specific workflows.",
};

export default function GeneralProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Gateway</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                Profile & Access Management
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Admin
            </Link>
            <Link
              href="/organizer/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Organizer
            </Link>
            <Link
              href="/portal"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        <Suspense
          fallback={
            <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
              <div className="h-44 rounded-2xl bg-slate-200" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="h-64 rounded-2xl bg-slate-200" />
                <div className="h-64 rounded-2xl bg-slate-200" />
              </div>
            </div>
          }
        >
          <ProfileView />
        </Suspense>
      </main>
    </div>
  );
}
