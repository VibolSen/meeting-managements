"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { BookingWizard } from "@/components/BookingWizard";
import { User } from "@/lib/api";

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  initialRoomId?: number;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  onSuccess?: () => void;
}

export function BookingModal({
  isOpen,
  onClose,
  currentUser,
  initialRoomId,
  initialDate,
  initialStartTime,
  initialEndTime,
  onSuccess,
}: BookingModalProps) {
  if (!isOpen) return null;

  // Key ensures a fresh wizard state when a new room slot or date is selected
  const wizardKey = `${initialRoomId ?? "any"}-${initialDate ?? "now"}-${initialStartTime ?? "s"}-${initialEndTime ?? "e"}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
    >
      <div className="-m-2 sm:m-0">
        <BookingWizard
          key={wizardKey}
          currentUser={currentUser}
          initialRoomId={initialRoomId}
          initialDate={initialDate}
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onSuccess={() => {
            if (onSuccess) onSuccess();
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </Modal>
  );
}

export default BookingModal;
