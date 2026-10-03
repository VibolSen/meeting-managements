import { Suspense } from "react";
import { NotificationFullPage } from "@/components/organizer/notifications";

export const metadata = {
  title: "Notifications & Alerts | Meeting Management System",
  description: "View meeting notifications, schedule changes, and RSVP alerts.",
};

export default function EmployeeNotificationsPage() {
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
