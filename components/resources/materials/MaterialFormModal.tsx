"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MaterialFormData } from "./types";
import { MaterialType } from "@/lib/api";

interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formMode: "create" | "edit";
  formData: MaterialFormData;
  onChange: (data: MaterialFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export function MaterialFormModal({
  isOpen,
  onClose,
  formMode,
  formData,
  onChange,
  onSubmit,
  loading,
}: MaterialFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formMode === "create" ? "Add Inventory Item" : "Edit Inventory Specifications"}
      description="Catalog AV equipment, stationery supplies, or catering logistics for meeting rooms."
      maxWidth="md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Item Name"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          placeholder="e.g., 4K Laser Projector, Wireless Microphones, Flipchart Pad"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Material Category"
            value={formData.type}
            onChange={(e) => onChange({ ...formData, type: e.target.value as MaterialType })}
          >
            <option value="EQUIPMENT">AV & IT Equipment</option>
            <option value="STATIONERY">Stationery & Presentation</option>
            <option value="CATERING">Catering & Refreshments</option>
          </Select>

          <Input
            label="Quantity Available in Stock"
            type="number"
            min={0}
            max={5000}
            value={formData.quantityAvailable}
            onChange={(e) =>
              onChange({ ...formData, quantityAvailable: Number(e.target.value) })
            }
            helperText="Inventory count currently ready for deployment"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={loading}
            className="text-xs bg-cyan-600 hover:bg-cyan-700"
          >
            {formMode === "create" ? "Add to Inventory" : "Save Item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
