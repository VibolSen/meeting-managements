import { Suspense } from "react";
import { EmployeeScheduleView } from "@/components/employee/schedule/EmployeeScheduleView";

export const metadata = {
  title: "My Schedule & Agenda | Meeting Management System",
  description: "View and manage your personal meeting agenda and conference timetable.",
};

export default function EmployeeSchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-5 animate-pulse">
          <div className="h-32 rounded-2xl bg-slate-200" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="h-96 rounded-2xl bg-slate-200" />
        </div>
      }
    >
      <EmployeeScheduleView />
    </Suspense>
  );
}
