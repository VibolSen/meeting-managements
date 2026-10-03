"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RoomFormData } from "./types";
import { RoomStatus } from "@/lib/api";

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formMode: "create" | "edit";
  formData: RoomFormData;
  onChange: (data: RoomFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export function RoomFormModal({
  isOpen,
  onClose,
  formMode,
  formData,
  onChange,
  onSubmit,
  loading,
}: RoomFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formMode === "create" ? "Add New Room Facility" : "Edit Room Specifications"}
      description="Configure conference room specifications, seating capacity, and operational status."
      maxWidth="md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Room Name"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          placeholder="e.g., Executive Boardroom, Alpha Innovation Hub"
          required
        />

        <Input
          label="Location / Floor / Wing"
          value={formData.location}
          onChange={(e) => onChange({ ...formData, location: e.target.value })}
          placeholder="e.g., Floor 4, West Wing"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Seating Capacity"
            type="number"
            min={1}
            max={300}
            value={formData.capacity}
            onChange={(e) => onChange({ ...formData, capacity: Number(e.target.value) })}
            helperText="Capacity >= 20 flagged as Executive Boardroom"
            required
          />

          <Select
            label="Operational Status"
            value={formData.status}
            onChange={(e) => onChange({ ...formData, status: e.target.value as RoomStatus })}
          >
            <option value="ACTIVE">Active (Available for booking)</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="INACTIVE">Inactive (Disabled)</option>
          </Select>
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
            className="text-xs bg-blue-600 hover:bg-blue-700"
          >
            {formMode === "create" ? "Create Room" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
