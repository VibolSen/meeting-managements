import { AttendeeResponseStatus } from "@/lib/api";

export type InvitationStatusFilter = "ALL" | "PENDING" | "ACCEPTED" | "DECLINED";
export type InvitationSortField = "startTime" | "title" | "organizer" | "rsvpStatus";
export type InvitationSortOrder = "asc" | "desc";
export type InvitationViewMode = "table" | "grid";

export interface InvitationStats {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
}
