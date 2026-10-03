import { Suspense } from "react";
import { EmployeeDashboardView } from "@/components/employee/dashboard/EmployeeDashboardView";

export const metadata = {
  title: "Employee Dashboard | Meeting Management System",
  description: "View today's meetings, pending invitations, and conference schedule.",
};

export default function EmployeeDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-5 animate-pulse">
          <div className="h-32 rounded-2xl bg-slate-200" />
          <div className="h-20 rounded-2xl bg-slate-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      }
    >
      <EmployeeDashboardView />
    </Suspense>
  );
}
