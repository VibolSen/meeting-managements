"use client";

import React from "react";
import {
  Box,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  Edit2,
  Layers,
} from "lucide-react";
import { Material } from "@/lib/api";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MaterialDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
  isAdmin: boolean;
  onEdit: (material: Material) => void;
  onAdjustStock: (material: Material, delta: number) => void;
  actionLoading: boolean;
}

export function MaterialDetailsModal({
  isOpen,
  onClose,
  material,
  isAdmin,
  onEdit,
  onAdjustStock,
  actionLoading,
}: MaterialDetailsModalProps) {
  if (!material) return null;

  const isLowStock = material.quantityAvailable > 0 && material.quantityAvailable < 5;
  const isOutOfStock = material.quantityAvailable === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Material Item Specifications"
      description="Inventory details, current stock levels, and quick stock adjustments."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Header Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50/70 via-slate-50 to-white border border-slate-200/80 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-cyan-600 text-white shadow-xs">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{material.name}</h3>
              <div className="inline-flex items-center gap-1.5 mt-1 text-[11px] font-semibold tracking-wider uppercase text-cyan-700 bg-cyan-100/70 px-2 py-0.5 rounded-md">
                <Layers className="w-3 h-3" />
                {material.type}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                Item ID: #{material.materialId}
              </div>
            </div>
          </div>

          <div>
            {isOutOfStock ? (
              <Badge variant="neutral">Out of Stock</Badge>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Low Stock
              </span>
            ) : (
              <Badge variant="available">In Stock</Badge>
            )}
          </div>
        </div>

        {/* Stock Level Card with Quick Stepper */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Warehouse Inventory</span>
            <span className="text-[11px] font-mono text-slate-400">Real-time Count</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900">
                {material.quantityAvailable}
              </span>
              <span className="text-xs text-slate-500 font-medium">units ready</span>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAdjustStock(material, -1)}
                  disabled={actionLoading || material.quantityAvailable <= 0}
                  className="h-8 text-xs px-2.5"
                  title="Deduct 1"
                >
                  <MinusCircle className="w-3.5 h-3.5 mr-1 text-slate-600" />
                  -1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAdjustStock(material, 1)}
                  disabled={actionLoading}
                  className="h-8 text-xs px-2.5"
                  title="Add 1"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                  +1
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Warning */}
        {isLowStock && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Inventory Low Stock Alert</div>
              <div className="text-[11px] text-amber-800/90 mt-0.5">
                Current inventory is below the recommended threshold of 5 units. Consider replenishing this item soon to prevent meeting logistical shortages.
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                onClose();
                onEdit(material);
              }}
              leftIcon={<Edit2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
              className="text-xs text-slate-700 border-slate-200 hover:bg-slate-50"
            >
              Edit
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onClose}
            className="text-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
