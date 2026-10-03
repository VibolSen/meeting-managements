"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { RoomScheduleView } from "@/components/RoomScheduleView";
import { useAuth } from "@/lib/auth";

function EmployeeRoomScheduleContent() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <RoomScheduleView
        currentUser={user}
        onNavigateToMeetings={() => router.push("/employee/my-schedule")}
      />
    </div>
  );
}

export default function EmployeeRoomSchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-400">
          Loading room schedule matrix...
        </div>
      }
    >
      <EmployeeRoomScheduleContent />
    </Suspense>
  );
}
