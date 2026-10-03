"use client";

import React from "react";
import {
  Box,
  Eye,
  Edit2,
  Trash2,
  PlusCircle,
  MinusCircle,
  Inbox,
  AlertTriangle,
} from "lucide-react";
import { Material } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MaterialCardGridProps {
  materials: Material[];
  loading: boolean;
  isAdmin: boolean;
  actionLoading: boolean;
  selectedMaterialIds: Set<number>;
  onToggleSelectMaterial: (materialId: number) => void;
  onViewMaterial: (material: Material) => void;
  onEditMaterial: (material: Material) => void;
  onAdjustStock: (material: Material, delta: number) => void;
  onDeleteMaterial: (materialId: number) => void;
}

export function MaterialCardGrid({
  materials,
  loading,
  isAdmin,
  actionLoading,
  selectedMaterialIds,
  onToggleSelectMaterial,
  onViewMaterial,
  onEditMaterial,
  onAdjustStock,
  onDeleteMaterial,
}: MaterialCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-4"
          >
            <div className="h-5 bg-slate-200 rounded-md w-2/3"></div>
            <div className="h-4 bg-slate-100 rounded-md w-1/3"></div>
            <div className="h-10 bg-slate-100 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No materials found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No inventory items match your search or filter criteria. Try adjusting filters or add an item.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {materials.map((mat) => {
        const isSelected = selectedMaterialIds.has(mat.materialId);
        const isLowStock = mat.quantityAvailable > 0 && mat.quantityAvailable < 5;
        const isOutOfStock = mat.quantityAvailable === 0;

        return (
          <Card
            key={mat.materialId}
            className={`p-5 border-slate-200 bg-white flex flex-col justify-between hover:border-cyan-300 transition-all group shadow-xs relative ${
              isSelected ? "ring-2 ring-cyan-500/50 border-cyan-300 bg-cyan-50/10" : ""
            }`}
          >
            <div className="space-y-3">
              {/* Header: Checkbox + Name + Category + Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  {isAdmin && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectMaterial(mat.materialId)}
                      className="mt-1 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                  )}
                  <div>
                    <h4
                      onClick={() => onViewMaterial(mat)}
                      className="text-base font-bold text-slate-900 group-hover:text-cyan-600 transition-colors cursor-pointer"
                    >
                      {mat.name}
                    </h4>
                    <span className="inline-block mt-0.5 text-[10px] font-bold tracking-wider uppercase text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                      {mat.type}
                    </span>
                  </div>
                </div>

                {isOutOfStock ? (
                  <Badge variant="neutral">Out of Stock</Badge>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Low Stock
                  </span>
                ) : (
                  <Badge variant="available">In Stock</Badge>
                )}
              </div>

              {/* Units Available Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Box className="w-3.5 h-3.5 text-cyan-600" />
                  Units Available
                </span>
                <span className="text-base font-mono font-bold text-slate-900">
                  {mat.quantityAvailable}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
              {/* Quick +/- Stock Steppers */}
              {isAdmin ? (
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px] font-semibold mr-0.5">Stock:</span>
                  <button
                    type="button"
                    onClick={() => onAdjustStock(mat, -1)}
                    disabled={actionLoading || mat.quantityAvailable <= 0}
                    className="p-1 rounded-md hover:bg-slate-200 text-slate-700 disabled:opacity-30 cursor-pointer transition-colors"
                    title="Deduct 1 Unit"
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdjustStock(mat, 1)}
                    disabled={actionLoading}
                    className="p-1 rounded-md hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                    title="Add 1 Unit"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-slate-400 text-[11px] font-mono">ID: #{mat.materialId}</span>
              )}

              <div className="inline-flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onViewMaterial(mat)}
                  className="text-slate-400 hover:text-cyan-600 hover:bg-cyan-50"
                  title="View Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>

                {isAdmin && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEditMaterial(mat)}
                      className="text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDeleteMaterial(mat.materialId)}
                      disabled={actionLoading}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
