import { Meeting, MeetingStatus } from "@/lib/api";

export type MyMeetingSortField = "startTime" | "title" | "room" | "status";
export type MyMeetingSortOrder = "asc" | "desc";
export type MyMeetingStatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type MyMeetingViewMode = "table" | "grid";

export interface MyMeetingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}
