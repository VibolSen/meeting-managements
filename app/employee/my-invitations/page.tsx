import { Suspense } from "react";
import { EmployeeInvitationsView } from "@/components/employee/invitations/EmployeeInvitationsView";

export const metadata = {
  title: "Meeting Invitations & RSVPs | Meeting Management System",
  description: "Review and respond to conference invitations, track acceptances, and prevent overlapping schedules.",
};

export default function EmployeeInvitationsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-5 animate-pulse">
          <div className="h-28 rounded-2xl bg-slate-200" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="h-16 rounded-2xl bg-slate-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64 rounded-2xl bg-slate-200" />
            <div className="h-64 rounded-2xl bg-slate-200" />
          </div>
        </div>
      }
    >
      <EmployeeInvitationsView />
    </Suspense>
  );
}
