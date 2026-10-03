"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingWizard } from "@/components/BookingWizard";
import { useAuth } from "@/lib/auth";

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const initialRoomId = searchParams.get("roomId")
    ? Number(searchParams.get("roomId"))
    : undefined;
  const initialDate = searchParams.get("date") || undefined;
  const initialStartTime = searchParams.get("startTime") || undefined;
  const initialEndTime = searchParams.get("endTime") || undefined;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="mb-2">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Book New Meeting
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Reserve conference rooms, assign catering or audiovisual equipment, select support staff, and invite attendees with live double-booking protection.
        </p>
      </div>

      <BookingWizard
        currentUser={user}
        onSuccess={() => router.push("/organizer/my-meetings")}
        onCancel={() => router.push("/organizer/dashboard")}
        initialRoomId={initialRoomId}
        initialDate={initialDate}
        initialStartTime={initialStartTime}
        initialEndTime={initialEndTime}
      />
    </div>
  );
}

export default function BookMeetingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-400">
          Loading booking wizard...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
