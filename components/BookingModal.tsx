"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { BookingWizard } from "@/components/BookingWizard";
import { User } from "@/lib/api";
import { Lock, Eye, CheckCircle2 } from "lucide-react";

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

  // View Only access check: Probation staff / intern restriction
  if (currentUser?.bookingAccess === "VIEW_ONLY") {
    return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100/80 text-amber-800 border border-amber-300">
              <Eye className="w-3.5 h-3.5" />
              <span>Probationary / View-Only Account</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Room Booking Restricted
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Your employee account is currently set to <strong>View Only</strong> access (probation staff or intern status). During probation, self-service room reservation is locked.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left space-y-2 text-xs">
            <p className="font-bold text-slate-700">What you can still do:</p>
            <ul className="space-y-1.5 text-slate-500 text-[11px]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Browse corporate room availability and calendar timelines</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Attend meetings and respond to RSVPs sent to you</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Receive reminder notifications on Telegram</span>
              </li>
            </ul>
          </div>

          <p className="text-[11px] text-slate-400">
            Need to book an urgent meeting? Ask an Organizer or your department administrator to reserve the slot or upgrade your account to Full Access.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Understood, Close
            </button>
          </div>
        </div>
      </Modal>
    );
  }

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
