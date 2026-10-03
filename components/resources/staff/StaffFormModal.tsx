"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StaffFormData } from "./types";
import { StaffRole, StaffAvailability } from "@/lib/api";

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formMode: "create" | "edit";
  formData: StaffFormData;
  onChange: (data: StaffFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export function StaffFormModal({
  isOpen,
  onClose,
  formMode,
  formData,
  onChange,
  onSubmit,
  loading,
}: StaffFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formMode === "create" ? "Enroll Support Staff" : "Edit Staff Profile"}
      description="Manage on-site support personnel qualifications, operational roles, and availability status."
      maxWidth="md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          placeholder="e.g., David Chen, Sarah Connor, Michael Scott"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Assigned Operational Role"
            value={formData.role}
            onChange={(e) => onChange({ ...formData, role: e.target.value as StaffRole })}
          >
            <option value="TECHNICIAN">Technician (IT / AV Support)</option>
            <option value="RECEPTIONIST">Receptionist (Host & Check-in)</option>
            <option value="FACILITATOR">Facilitator (Meeting Moderator)</option>
          </Select>

          <Select
            label="Availability Status"
            value={formData.availabilityStatus}
            onChange={(e) =>
              onChange({
                ...formData,
                availabilityStatus: e.target.value as StaffAvailability,
              })
            }
          >
            <option value="AVAILABLE">Available (On-Duty)</option>
            <option value="ASSIGNED">Assigned (In Meeting)</option>
            <option value="OFF_DUTY">Off Duty (Unavailable)</option>
          </Select>
        </div>

        <Input
          label="Skills & Specializations"
          value={formData.skill}
          onChange={(e) => onChange({ ...formData, skill: e.target.value })}
          placeholder="e.g., Polycom setup, soundboard mixing, guest registration"
          helperText="Key qualifications for matching meeting logistics needs"
        />

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
            className="text-xs bg-violet-600 hover:bg-violet-700"
          >
            {formMode === "create" ? "Enroll Staff" : "Save Profile"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
