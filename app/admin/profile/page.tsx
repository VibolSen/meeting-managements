import { Suspense } from "react";
import { ProfileView } from "@/components/profile/ProfileView";

export const metadata = {
  title: "User Profile & Roles | Meeting Management System",
  description: "View and manage user profile details, credentials, and role-specific workflows across Administrator, Organizer, and Employee perspectives.",
};

export default function ProfilePage() {
  return (
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
      <ProfileView preferredRole="ADMIN" />
    </Suspense>
  );
}
