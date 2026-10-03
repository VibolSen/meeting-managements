import { Material, MaterialType } from "@/lib/api";

export type MaterialSortField = "name" | "type" | "quantityAvailable";
export type SortOrder = "asc" | "desc";
export type MaterialViewMode = "table" | "grid";
export type MaterialCategoryFilter = "ALL" | MaterialType;
export type MaterialStockFilter = "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface MaterialFormData {
  materialId?: number;
  name: string;
  type: MaterialType;
  quantityAvailable: number;
}

export interface MaterialStats {
  totalItems: number;
  totalUnits: number;
  lowStockCount: number;
  equipmentCount: number;
  stationeryCount: number;
  cateringCount: number;
}
