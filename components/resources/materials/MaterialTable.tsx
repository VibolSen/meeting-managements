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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MaterialTableProps {
  materials: Material[];
  loading: boolean;
  isAdmin: boolean;
  actionLoading: boolean;
  selectedMaterialIds: Set<number>;
  onToggleSelectMaterial: (materialId: number) => void;
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
  onViewMaterial: (material: Material) => void;
  onEditMaterial: (material: Material) => void;
  onAdjustStock: (material: Material, delta: number) => void;
  onDeleteMaterial: (materialId: number) => void;
}

export function MaterialTable({
  materials,
  loading,
  isAdmin,
  actionLoading,
  selectedMaterialIds,
  onToggleSelectMaterial,
  onToggleSelectAll,
  isAllSelected,
  onViewMaterial,
  onEditMaterial,
  onAdjustStock,
  onDeleteMaterial,
}: MaterialTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-8 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          <p className="text-xs text-slate-500 font-medium">Loading inventory catalog...</p>
        </div>
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
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
            <tr>
              {isAdmin && (
                <th className="p-3.5 pl-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    title="Select All Items on Current Page"
                  />
                </th>
              )}
              <th className="p-3.5 font-bold text-slate-700">Item Name & ID</th>
              <th className="p-3.5 font-bold text-slate-700">Category</th>
              <th className="p-3.5 font-bold text-slate-700">Quantity in Stock</th>
              <th className="p-3.5 font-bold text-slate-700">Inventory Status</th>
              <th className="p-3.5 pr-4 text-right font-bold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materials.map((mat) => {
              const isSelected = selectedMaterialIds.has(mat.materialId);
              const isLowStock = mat.quantityAvailable > 0 && mat.quantityAvailable < 5;
              const isOutOfStock = mat.quantityAvailable === 0;

              return (
                <tr
                  key={mat.materialId}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isSelected ? "bg-cyan-50/40" : ""
                  }`}
                >
                  {isAdmin && (
                    <td className="p-3.5 pl-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectMaterial(mat.materialId)}
                        className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                      />
                    </td>
                  )}

                  {/* Name & ID */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 shrink-0">
                        <Box className="w-4 h-4" />
                      </div>
                      <div>
                        <button
                          onClick={() => onViewMaterial(mat)}
                          className="font-bold text-slate-900 hover:text-cyan-600 transition-colors cursor-pointer text-left"
                        >
                          {mat.name}
                        </button>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: #{mat.materialId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-3.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide uppercase bg-slate-100 text-slate-700">
                      {mat.type}
                    </span>
                  </td>

                  {/* Quantity with Inline Steppers */}
                  <td className="p-3.5">
                    <div className="inline-flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80">
                      {isAdmin && (
                        <button
                          onClick={() => onAdjustStock(mat, -1)}
                          disabled={actionLoading || mat.quantityAvailable <= 0}
                          className="p-0.5 rounded-md hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer transition-colors"
                          title="Deduct 1"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <span className="font-mono font-bold text-slate-900 text-sm min-w-[24px] text-center">
                        {mat.quantityAvailable}
                      </span>

                      {isAdmin && (
                        <button
                          onClick={() => onAdjustStock(mat, 1)}
                          disabled={actionLoading}
                          className="p-0.5 rounded-md hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors"
                          title="Add 1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <span className="text-[11px] text-slate-400">units</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-3.5">
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
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 pr-4 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onViewMaterial(mat)}
                        className="text-slate-400 hover:text-cyan-600 hover:bg-cyan-50"
                        title="View Item Specifications"
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
