"use client";

import React from "react";
import {
  Building,
  MapPin,
  Users,
  ShieldCheck,
  Eye,
  Edit2,
  Trash2,
  Wrench,
  CheckCircle2,
  Inbox,
  Tv,
} from "lucide-react";
import { Room } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RoomTableProps {
  rooms: Room[];
  loading: boolean;
  isAdmin: boolean;
  actionLoading: boolean;
  selectedRoomIds: Set<number>;
  onToggleSelectRoom: (roomId: number) => void;
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
  onViewRoom: (room: Room) => void;
  onEditRoom: (room: Room) => void;
  onToggleRoomStatus: (room: Room) => void;
  onDeleteRoom: (roomId: number) => void;
}

export function RoomTable({
  rooms,
  loading,
  isAdmin,
  actionLoading,
  selectedRoomIds,
  onToggleSelectRoom,
  onToggleSelectAll,
  isAllSelected,
  onViewRoom,
  onEditRoom,
  onToggleRoomStatus,
  onDeleteRoom,
}: RoomTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-8 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-xs text-slate-500 font-medium">Loading room facilities...</p>
        </div>
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
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
            <tr>
              {isAdmin && (
                <th className="p-3.5 pl-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    title="Select All Rooms on Current Page"
                  />
                </th>
              )}
              <th className="p-3.5 font-bold text-slate-700">Room Facility</th>
              <th className="p-3.5 font-bold text-slate-700">Location / Floor</th>
              <th className="p-3.5 font-bold text-slate-700">Capacity</th>
              <th className="p-3.5 font-bold text-slate-700">Operational Status</th>
              <th className="p-3.5 pr-4 text-right font-bold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map((room) => {
              const isSelected = selectedRoomIds.has(room.roomId);
              const isBoardroom = room.capacity >= 20;

              return (
                <tr
                  key={room.roomId}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isSelected ? "bg-indigo-50/40" : ""
                  }`}
                >
                  {isAdmin && (
                    <td className="p-3.5 pl-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectRoom(room.roomId)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                  )}

                  {/* Room Name & Specs */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewRoom(room)}
                            className="font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer text-left"
                          >
                            {room.name}
                          </button>
                          {isBoardroom && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <ShieldCheck className="w-3 h-3 text-amber-600" />
                              Boardroom
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ID: #{room.roomId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{room.location}</span>
                    </div>
                  </td>

                  {/* Seating Capacity */}
                  <td className="p-3.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium text-xs">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-mono font-bold">{room.capacity}</span>
                      <span className="text-slate-500 text-[11px]">seats</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="p-3.5">
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
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 pr-4 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      {/* View Details */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onViewRoom(room)}
                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="View Room Specifications"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      {/* Wall Tablet Kiosk Display */}
                      <a
                        href={`/room-display/${room.roomId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors inline-flex items-center justify-center cursor-pointer"
                        title="Launch Wall Tablet Display Kiosk"
                      >
                        <Tv className="w-3.5 h-3.5" />
                      </a>

                      {isAdmin && (
                        <>
                          {/* Quick Toggle Status */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onToggleRoomStatus(room)}
                            disabled={actionLoading}
                            className={
                              room.status === "ACTIVE"
                                ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }
                            title={
                              room.status === "ACTIVE"
                                ? "Flag Under Maintenance"
                                : "Set Active (Available)"
                            }
                          >
                            {room.status === "ACTIVE" ? (
                              <Wrench className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </Button>

                          {/* Edit Room */}
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

                          {/* Delete Room */}
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
