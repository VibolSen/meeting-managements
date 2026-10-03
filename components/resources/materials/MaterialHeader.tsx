"use client";

import React from "react";
import { Package, Plus, RefreshCw, Upload } from "lucide-react";
import { RiFileExcel2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MaterialHeaderProps {
  isAdmin: boolean;
  loading: boolean;
  totalMaterials: number;
  onRefresh: () => void;
  onAddMaterial: () => void;
  onImportMaterials: () => void;
  onExportExcel: () => void;
}

export function MaterialHeader({
  isAdmin,
  loading,
  totalMaterials,
  onRefresh,
  onAddMaterial,
  onImportMaterials,
  onExportExcel,
}: MaterialHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-cyan-50/70 via-white to-slate-50 shadow-xs">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Materials & Equipment Inventory
          </span>
          <Badge variant="neutral" size="sm" className="font-mono">
            {totalMaterials} {totalMaterials === 1 ? "Item" : "Items"}
          </Badge>
          {isAdmin ? (
            <Badge variant="confirmed" size="sm">Admin Access</Badge>
          ) : (
            <Badge variant="neutral" size="sm">Read Only</Badge>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 pl-1">
          Catalog conference technology, stationery, presentation tools, and catering hospitality inventory.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          title="Refresh Inventory"
        >
          Refresh
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportExcel}
          leftIcon={<RiFileExcel2Line className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          className="text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/90 border-emerald-200"
          title="Export Inventory to Excel"
        >
          Export
        </Button>

        {isAdmin && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onImportMaterials}
              leftIcon={<Upload className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
              className="text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/90 border-indigo-200"
              title="Import from Excel or Google Sheets"
            >
              Import
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onAddMaterial}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Item
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
