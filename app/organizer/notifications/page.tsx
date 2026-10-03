import { Suspense } from "react";
import { NotificationFullPage } from "@/components/organizer/notifications";

export default function OrganizerNotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-400">
          Loading notifications...
        </div>
      }
    >
      <NotificationFullPage />
    </Suspense>
  );
}
