import { Room, RoomStatus } from "@/lib/api";

export type RoomSortField = "name" | "location" | "capacity" | "status";
export type SortOrder = "asc" | "desc";
export type RoomViewMode = "table" | "grid";
export type RoomStatusFilter = "ALL" | RoomStatus;
export type RoomCapacityFilter = "ALL" | "SMALL" | "MEDIUM" | "LARGE";

export interface RoomFormData {
  roomId?: number;
  name: string;
  location: string;
  capacity: number;
  status: RoomStatus;
}

export interface RoomStats {
  total: number;
  active: number;
  maintenance: number;
  inactive: number;
  totalCapacity: number;
}
