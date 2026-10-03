"use client";

import React from "react";
import {
  MapPin,
  Users,
  ShieldCheck,
  Eye,
  Edit2,
  Trash2,
  Wrench,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import { Room } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RoomCardGridProps {
  rooms: Room[];
  loading: boolean;
  isAdmin: boolean;
  actionLoading: boolean;
  selectedRoomIds: Set<number>;
  onToggleSelectRoom: (roomId: number) => void;
  onViewRoom: (room: Room) => void;
  onEditRoom: (room: Room) => void;
  onToggleRoomStatus: (room: Room) => void;
  onDeleteRoom: (roomId: number) => void;
}

export function RoomCardGrid({
  rooms,
  loading,
  isAdmin,
  actionLoading,
  selectedRoomIds,
  onToggleSelectRoom,
  onViewRoom,
  onEditRoom,
  onToggleRoomStatus,
  onDeleteRoom,
}: RoomCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-4"
          >
            <div className="h-5 bg-slate-200 rounded-md w-2/3"></div>
            <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
            <div className="h-10 bg-slate-100 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No rooms found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No meeting rooms match your search or filter criteria. Try adjusting filters or create a new room.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => {
        const isSelected = selectedRoomIds.has(room.roomId);
        const isBoardroom = room.capacity >= 20;

        return (
          <Card
            key={room.roomId}
            className={`p-5 border-slate-200 bg-white flex flex-col justify-between hover:border-indigo-300 transition-all group shadow-xs relative ${
              isSelected ? "ring-2 ring-indigo-500/50 border-indigo-300 bg-indigo-50/10" : ""
            }`}
          >
            <div className="space-y-3">
              {/* Header: Checkbox + Name + Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  {isAdmin && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectRoom(room.roomId)}
                      className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  )}
                  <div>
                    <h4
                      onClick={() => onViewRoom(room)}
                      className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {room.name}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {room.location}
                    </p>
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
                    ? "Maintenance"
                    : "Inactive"}
                </Badge>
              </div>

              {/* Seating Capacity pill */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Seating Capacity
                </span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {room.capacity} Persons
                </span>
              </div>

              {/* Boardroom Alert */}
              {isBoardroom && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>Executive Boardroom &bull; Requires Admin Approval</span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
              {isAdmin ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleRoomStatus(room)}
                  disabled={actionLoading}
                  leftIcon={
                    room.status === "ACTIVE" ? (
                      <Wrench className="w-3 h-3 text-amber-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    )
                  }
                  className={`h-7 px-2 text-[11px] font-semibold rounded-lg ${
                    room.status === "ACTIVE"
                      ? "text-slate-600 hover:text-amber-700 hover:bg-amber-50"
                      : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {room.status === "ACTIVE" ? "Maintenance" : "Set Active"}
                </Button>
              ) : (
                <span className="text-slate-400 text-[11px] font-mono">ID: #{room.roomId}</span>
              )}

              <div className="inline-flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onViewRoom(room)}
                  className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                  title="View Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>

                {isAdmin && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEditRoom(room)}
                      className="text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Edit Room"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDeleteRoom(room.roomId)}
                      disabled={actionLoading}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Room"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
