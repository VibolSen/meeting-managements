"use client";

import React from "react";
import {
  Building,
  MapPin,
  Users,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  CalendarCheck,
  Edit2,
} from "lucide-react";
import { Room } from "@/lib/api";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  isAdmin: boolean;
  onEdit: (room: Room) => void;
  onToggleStatus: (room: Room) => void;
  actionLoading: boolean;
}

export function RoomDetailsModal({
  isOpen,
  onClose,
  room,
  isAdmin,
  onEdit,
  onToggleStatus,
  actionLoading,
}: RoomDetailsModalProps) {
  if (!room) return null;

  const isBoardroom = room.capacity >= 20;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Meeting Room Specifications"
      description="Facility overview, logistical details, and booking parameters."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Header Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-slate-50 to-white dark:from-blue-950/40 dark:via-slate-900/80 dark:to-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-xs">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{room.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {room.location}
              </p>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                Facility ID: #{room.roomId}
              </div>
            </div>
          </div>

          <Badge
            variant={
              room.status === "ACTIVE"
                ? "available"
                : room.status === "UNDER_MAINTENANCE"
                ? "maintenance"
                : "neutral"
            }
          >
            {room.status === "ACTIVE"
              ? "Available"
              : room.status === "UNDER_MAINTENANCE"
              ? "Under Maintenance"
              : "Inactive"}
          </Badge>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Seating Capacity
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">
              {room.capacity} Persons
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
              Booking Policy
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-1.5">
              {isBoardroom ? "Admin Approval Required" : "Instant Booking Enabled"}
            </div>
          </div>
        </div>

        {/* Boardroom Note */}
        {isBoardroom && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Executive Boardroom Facility</div>
              <div className="text-[11px] text-amber-800/90 mt-0.5">
                Due to large seating capacity ({room.capacity}+ seats) and executive AV equipment, bookings for this room require administrative sign-off before confirmation.
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {isAdmin ? (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => onToggleStatus(room)}
              disabled={actionLoading}
              leftIcon={
                room.status === "ACTIVE" ? (
                  <Wrench className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )
              }
              className={`text-xs ${
                room.status === "ACTIVE"
                  ? "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              {room.status === "ACTIVE" ? "Flag Under Maintenance" : "Set Active"}
            </Button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(room);
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
      </div>
    </Modal>
  );
}
