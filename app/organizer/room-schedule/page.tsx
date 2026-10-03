"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { RoomScheduleView } from "@/components/RoomScheduleView";
import { useAuth } from "@/lib/auth";

function ScheduleContent() {
  const router = useRouter();
  const { user } = useAuth();

  const handleBookSlot = (
    roomId: number,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    router.push(
      `/organizer/book-meeting?roomId=${roomId}&date=${date}&startTime=${encodeURIComponent(
        startTime
      )}&endTime=${encodeURIComponent(endTime)}`
    );
  };

  return (
    <div className="space-y-4">
      <RoomScheduleView
        currentUser={user}
        onBookSlot={handleBookSlot}
        onNavigateToMeetings={() => router.push("/organizer/my-meetings")}
      />
    </div>
  );
}

export default function RoomSchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-400">
          Loading schedule view...
        </div>
      }
    >
      <ScheduleContent />
    </Suspense>
  );
}
