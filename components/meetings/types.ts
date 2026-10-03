import { Meeting, MeetingStatus, Room, User } from "@/lib/api";

export type MeetingSortField = "startTime" | "title" | "room" | "status";
export type SortOrder = "asc" | "desc";
export type MeetingStatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "MINE";
export type MeetingViewMode = "table" | "grid";

export interface MeetingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  myMeetings: number;
}
