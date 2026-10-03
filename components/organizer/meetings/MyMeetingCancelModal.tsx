"use client";

import React, { useState } from "react";
import { AlertTriangle, Ban } from "lucide-react";
import { Meeting } from "@/lib/api";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface MyMeetingCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onConfirmCancel: (meetingId: number, reason: string) => Promise<void>;
}

export function MyMeetingCancelModal({
  isOpen,
  onClose,
  meeting,
  onConfirmCancel,
}: MyMeetingCancelModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!meeting) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for cancelling this meeting.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onConfirmCancel(meeting.meetingId, reason.trim());
      setReason("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to cancel meeting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!loading) {
          setReason("");
          setError(null);
          onClose();
        }
      }}
      title="Cancel Organized Meeting"
      description="Provide a cancellation reason to notify all participants."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <p className="text-xs font-bold text-slate-800">{meeting.title}</p>
          <p className="text-[11px] text-slate-500">
            {meeting.room?.name || "Room"} • {meeting.attendees?.length || 0} attendees
          </p>
        </div>

        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Cancelling will release the room reservation, automatically restock any reserved materials, and send email/inbox alerts to all attendees.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Cancellation Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g., Rescheduled due to client availability conflict..."
            rows={3}
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Keep Meeting
          </Button>

          <Button
            type="submit"
            variant="danger"
            size="sm"
            isLoading={loading}
            leftIcon={<Ban className="w-3.5 h-3.5" />}
          >
            Confirm Cancellation
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default MyMeetingCancelModal;
