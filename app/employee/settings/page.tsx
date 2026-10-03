import { Suspense } from "react";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata = {
  title: "Employee Settings | Meeting Management System",
  description:
    "Employee user preferences, regional timezones, notification channels, and account security controls.",
};

export default function EmployeeSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
          <div className="h-16 rounded-2xl bg-slate-200" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-64 rounded-2xl bg-slate-200" />
            <div className="md:col-span-3 h-96 rounded-2xl bg-slate-200" />
          </div>
        </div>
      }
    >
      <SettingsView role="EMPLOYEE" />
    </Suspense>
  );
}
