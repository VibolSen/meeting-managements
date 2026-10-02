import { Suspense } from "react";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Loading dashboard...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
