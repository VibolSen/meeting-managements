"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeBookMeetingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/employee/dashboard");
  }, [router]);

  return (
    <div className="p-8 text-center text-sm text-slate-400">
      Redirecting to dashboard...
    </div>
  );
}
