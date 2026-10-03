import { Suspense } from "react";
import { OrganizerDashboardView } from "@/components/organizer/dashboard";

export default function OrganizerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-400">
          Loading organizer workspace...
        </div>
      }
    >
      <OrganizerDashboardView />
    </Suspense>
  );
}
