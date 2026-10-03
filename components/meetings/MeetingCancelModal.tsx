"use client";

import React from "react";
import { Ban, AlertTriangle } from "lucide-react";
import { Meeting } from "@/lib/api";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface MeetingCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  cancelReason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function MeetingCancelModal({
  isOpen,
  onClose,
  meeting,
  cancelReason,
  onReasonChange,
  onConfirm,
  loading,
}: MeetingCancelModalProps) {
  if (!meeting) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-rose-600">
          <Ban className="w-4 h-4" />
          <span>Cancel Meeting Reservation</span>
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Warning Alert */}
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Are you sure you want to cancel this meeting?</p>
            <p className="text-[11px] text-rose-700">
              Cancelling will release boardroom <strong>{meeting.room?.name}</strong> and immediately replenish reserved equipment stock back into inventory.
            </p>
          </div>
        </div>

        {/* Meeting Summary */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <p className="font-bold text-slate-800">{meeting.title}</p>
          <p className="text-slate-500 font-mono text-[11px]">
            {meeting.startTime.replace("T", " ").slice(0, 16)} – {meeting.endTime.replace("T", " ").slice(11, 16)}
          </p>
        </div>

        {/* Reason Input */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-700">
            Cancellation Reason <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="e.g., Client rescheduled to next week, room conflict resolved..."
            rows={3}
            className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-xs"
          />
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-xs"
          >
            Keep Meeting
          </Button>

          <Button
            variant="danger"
            size="sm"
            type="button"
            onClick={onConfirm}
            isLoading={loading}
            leftIcon={<Ban className="w-3.5 h-3.5 shrink-0" />}
          >
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </Modal>
  );
}
