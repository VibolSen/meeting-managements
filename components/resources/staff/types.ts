import { Staff, StaffRole, StaffAvailability } from "@/lib/api";

export type StaffSortField = "name" | "role" | "availabilityStatus";
export type SortOrder = "asc" | "desc";
export type StaffViewMode = "table" | "grid";
export type StaffRoleFilter = "ALL" | StaffRole;
export type StaffAvailabilityFilter = "ALL" | StaffAvailability;

export interface StaffFormData {
  staffId?: number;
  name: string;
  role: StaffRole;
  skill: string;
  availabilityStatus: StaffAvailability;
}

export interface StaffStats {
  total: number;
  available: number;
  assigned: number;
  offDuty: number;
}
