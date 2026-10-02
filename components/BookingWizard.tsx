"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Wrench,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import {
  api,
  Room,
  RoomAvailability,
  Material,
  Staff,
  User,
  MeetingCreateRequest,
} from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { useToast } from "@/components/Toast";

interface BookingWizardProps {
  currentUser: User | null;
  onSuccess: () => void;
  onCancel: () => void;
  initialRoomId?: number;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
}

export function BookingWizard({
  currentUser,
  onSuccess,
  onCancel,
  initialRoomId,
  initialDate,
  initialStartTime,
  initialEndTime,
}: BookingWizardProps) {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [organizerId, setOrganizerId] = useState<number>(currentUser?.userId || 2);
  const [date, setDate] = useState(
    initialDate || new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState(initialStartTime || "10:00");
  const [endTime, setEndTime] = useState(initialEndTime || "11:00");
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(initialRoomId || null);

  // Logistics state
  const [selectedMaterials, setSelectedMaterials] = useState<Record<number, number>>({});
  const [selectedStaff, setSelectedStaff] = useState<Record<number, string>>({});
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);

  // Remote data state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roomAvailabilities, setRoomAvailabilities] = useState<Record<number, RoomAvailability>>({});
  const [checkingRooms, setCheckingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initial Data Load
  useEffect(() => {
    Promise.all([
      api.rooms.getAll().catch(() => []),
      api.materials.getAll().catch(() => []),
      api.users.getAll().catch(() => []),
    ]).then(([roomsData, materialsData, usersData]) => {
      setRooms(roomsData);
      setMaterials(materialsData);
      setUsers(usersData);
      if (initialRoomId) setSelectedRoomId(initialRoomId);
      if (currentUser?.userId) setOrganizerId(currentUser.userId);
    });
  }, [initialRoomId, currentUser]);

  // ISO Dates Helper
  const getIsoTimestamps = () => {
    const startIso = `${date}T${startTime}:00`;
    const endIso = `${date}T${endTime}:00`;
    return { startIso, endIso };
  };

  // Re-check room availabilities & available staff whenever date/time changes
  useEffect(() => {
    if (!date || !startTime || !endTime) return;
    const { startIso, endIso } = getIsoTimestamps();

    if (new Date(startIso) >= new Date(endIso)) return;

    setCheckingRooms(true);
    Promise.all([
      ...rooms.map(async (r) => {
        try {
          const avail = await api.rooms.checkAvailability(r.roomId, startIso, endIso);
          return { roomId: r.roomId, avail };
        } catch {
          return {
            roomId: r.roomId,
            avail: {
              roomId: r.roomId,
              name: r.name,
              location: r.location,
              capacity: r.capacity,
              status: r.status,
              available: false,
              conflictReason: "Unable to verify availability with backend API",
            } as RoomAvailability,
          };
        }
      }),
      api.staff.getAvailable(startIso, endIso).catch(() => []),
    ]).then((results) => {
      const staffList = results.pop() as Staff[];
      setAvailableStaff(staffList || []);

      const availMap: Record<number, RoomAvailability> = {};
      (results as { roomId: number; avail: RoomAvailability }[]).forEach((res) => {
        availMap[res.roomId] = res.avail;
      });
      setRoomAvailabilities(availMap);
      setCheckingRooms(false);
    });
  }, [date, startTime, endTime, rooms.length]);

  // Step 1 Validation
  const validateStep1 = () => {
    if (!title.trim()) {
      toast.error("Title required", "Please enter a meeting title.");
      return false;
    }
    const { startIso, endIso } = getIsoTimestamps();
    if (new Date(startIso) >= new Date(endIso)) {
      toast.error("Invalid Times", "Start time must be before end time.");
      return false;
    }
    return true;
  };

  // Step 2 Validation (Room)
  const validateStep2 = () => {
    if (!selectedRoomId) {
      toast.error("Select Room", "Please select a meeting room.");
      return false;
    }
    const avail = roomAvailabilities[selectedRoomId];
    if (avail && !avail.available) {
      toast.error("Room Conflict", avail.conflictReason || "Selected room is not available.");
      return false;
    }
    return true;
  };

  // Final Submission
  const handleSubmit = async () => {
    if (!selectedRoomId) return;
    const { startIso, endIso } = getIsoTimestamps();

    const payload: MeetingCreateRequest = {
      title,
      purpose,
      organizerId,
      roomId: selectedRoomId,
      startTime: startIso,
      endTime: endIso,
      attendeeIds: selectedAttendees,
      materials: Object.entries(selectedMaterials)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ materialId: Number(id), quantityRequested: qty })),
      staffAssignments: Object.entries(selectedStaff).map(([id, role]) => ({
        staffId: Number(id),
        assignedRole: role,
      })),
    };

    setSubmitting(true);
    try {
      const result = await api.meetings.create(payload);
      if (result.status === "PENDING") {
        toast.warning(
          "Submitted for Approval",
          "Boardroom booking (cap >= 20) routed to Admin queue."
        );
      } else {
        toast.success("Meeting Confirmed!", "Your meeting room has been successfully reserved.");
      }
      onSuccess();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error("Booking Failed", errorObj?.message || "Could not reserve meeting room.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRoom = rooms.find((r) => r.roomId === selectedRoomId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Cancel */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Schedule a Meeting
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Step-by-step reservation with real-time double-booking prevention and logistics support.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-slate-500">
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        {[
          { num: 1, label: "Details & Time" },
          { num: 2, label: "Room Selection" },
          { num: 3, label: "Logistics & Staff" },
          { num: 4, label: "Confirmation" },
        ].map((step, idx) => (
          <React.Fragment key={step.num}>
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === step.num
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/20"
                    : currentStep > step.num
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {currentStep > step.num ? <Check className="w-3.5 h-3.5" /> : step.num}
              </div>
              <span
                className={`text-xs font-semibold hidden md:inline ${
                  currentStep === step.num ? "text-slate-900 font-bold" : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < 3 && <div className="h-0.5 flex-1 mx-2 bg-slate-200 hidden sm:block" />}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1: Details & Time */}
      {currentStep === 1 && (
        <Card className="space-y-5 p-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Step 1: Meeting Details & Time Window</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Meeting Title"
                placeholder="e.g. Q4 Executive Strategy Sync"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <Textarea
                label="Meeting Purpose & Agenda (Optional)"
                placeholder="Outline discussion items and expected outcomes..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <Select
                label="Meeting Organizer"
                value={organizerId}
                onChange={(e) => setOrganizerId(Number(e.target.value))}
                required
              >
                {users.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label="Start Time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label="End Time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button
              variant="primary"
              onClick={() => {
                if (validateStep1()) setCurrentStep(2);
              }}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next: Select Room
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Room Selection with Live Conflict Check */}
      {currentStep === 2 && (
        <Card className="space-y-5 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Step 2: Choose Room & Real-Time Conflict Detection</span>
              </h3>
              <p className="text-xs text-slate-500">
                Checking availability for:{" "}
                <span className="text-indigo-600 font-semibold">
                  {date} ({startTime} - {endTime})
                </span>
              </p>
            </div>
            {checkingRooms && (
              <span className="text-xs text-indigo-600 flex items-center gap-1.5 animate-pulse">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                Validating room schedules...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rooms.map((room) => {
              const avail = roomAvailabilities[room.roomId];
              const isAvailable = avail ? avail.available : true;
              const isSelected = selectedRoomId === room.roomId;
              const isBoardroom = room.capacity >= 20;

              return (
                <div
                  key={room.roomId}
                  onClick={() => {
                    if (isAvailable) setSelectedRoomId(room.roomId);
                  }}
                  className={`relative p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                    !isAvailable
                      ? "opacity-60 bg-slate-50 border-rose-200 cursor-not-allowed"
                      : isSelected
                      ? "bg-indigo-50/70 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{room.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {room.location}
                      </p>
                    </div>

                    <Badge variant={isAvailable ? "available" : "conflict"}>
                      {isAvailable ? "Available" : "Occupied"}
                    </Badge>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Capacity: {room.capacity} seats
                    </span>

                    {isBoardroom ? (
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Admin Approval Req.
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Auto-Confirmed
                      </span>
                    )}
                  </div>

                  {/* Conflict Notice */}
                  {!isAvailable && avail?.conflictReason && (
                    <div className="mt-3 p-2 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 flex items-start gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{avail.conflictReason}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (validateStep2()) setCurrentStep(3);
              }}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next: Logistics & Staff
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Equipment & Staff */}
      {currentStep === 3 && (
        <Card className="space-y-6 p-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-600" />
            <span>Step 3: Materials, Equipment & Support Staff</span>
          </h3>

          {/* Section A: Materials */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                Equipment & Catering Requests
              </h4>
              <span className="text-[11px] text-slate-500">Reserved upon booking</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {materials.map((mat) => {
                const currentQty = selectedMaterials[mat.materialId] || 0;
                return (
                  <div
                    key={mat.materialId}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{mat.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Available in stock:{" "}
                        <span className="text-indigo-600 font-bold">
                          {mat.quantityAvailable}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (currentQty > 0) {
                            setSelectedMaterials({
                              ...selectedMaterials,
                              [mat.materialId]: currentQty - 1,
                            });
                          }
                        }}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold shadow-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-slate-900">
                        {currentQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (currentQty < mat.quantityAvailable) {
                            setSelectedMaterials({
                              ...selectedMaterials,
                              [mat.materialId]: currentQty + 1,
                            });
                          } else {
                            toast.warning("Stock Limit", `Only ${mat.quantityAvailable} available.`);
                          }
                        }}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold shadow-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Staff */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-violet-600" />
                Support Staff (Technicians, Receptionists, Facilitators)
              </h4>
              <span className="text-[11px] text-emerald-700 font-semibold">
                Filtered: Free during this slot
              </span>
            </div>

            {availableStaff.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No support personnel available for this time window.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableStaff.map((staff) => {
                  const isAssigned = staff.staffId in selectedStaff;
                  return (
                    <div
                      key={staff.staffId}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isAssigned
                          ? "bg-violet-50/80 border-violet-300"
                          : "bg-slate-50/70 border-slate-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-900">{staff.name}</p>
                          <Badge variant="neutral" withDot={false}>
                            {staff.role}
                          </Badge>
                        </div>
                        {staff.skill && (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {staff.skill}
                          </p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant={isAssigned ? "danger" : "outline"}
                        onClick={() => {
                          if (isAssigned) {
                            const updated = { ...selectedStaff };
                            delete updated[staff.staffId];
                            setSelectedStaff(updated);
                          } else {
                            setSelectedStaff({
                              ...selectedStaff,
                              [staff.staffId]: staff.role,
                            });
                          }
                        }}
                      >
                        {isAssigned ? "Remove" : "Assign"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section C: Attendees */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Invite Attendees
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {users.map((u) => {
                const isSelected = selectedAttendees.includes(u.userId);
                return (
                  <button
                    key={u.userId}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedAttendees(selectedAttendees.filter((id) => id !== u.userId));
                      } else {
                        setSelectedAttendees([...selectedAttendees, u.userId]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between shadow-xs ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="line-clamp-1">{u.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() => setCurrentStep(4)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next: Review & Confirm
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: Review & Final Confirmation */}
      {currentStep === 4 && (
        <Card className="space-y-6 p-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Step 4: Review Meeting Summary</span>
          </h3>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <h4 className="text-lg font-bold text-slate-900">{title}</h4>
                {purpose && <p className="text-xs text-slate-600 mt-0.5">{purpose}</p>}
              </div>

              {selectedRoom && selectedRoom.capacity >= 20 ? (
                <Badge variant="pending">Will Require Admin Approval</Badge>
              ) : (
                <Badge variant="confirmed">Will Auto-Confirm</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div>
                <span className="text-slate-500 block">Date & Time:</span>
                <span className="font-bold text-slate-900">
                  {date} ({startTime} - {endTime})
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Selected Space:</span>
                <span className="font-bold text-slate-900">
                  {selectedRoom?.name} ({selectedRoom?.location}, {selectedRoom?.capacity} seats)
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Equipment Reserved:</span>
                <span className="font-bold text-slate-900">
                  {Object.entries(selectedMaterials).filter(([, q]) => q > 0).length > 0
                    ? Object.entries(selectedMaterials)
                        .filter(([, q]) => q > 0)
                        .map(([id, q]) => {
                          const m = materials.find((mat) => mat.materialId === Number(id));
                          return `${m?.name} (${q})`;
                        })
                        .join(", ")
                    : "None requested"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Staff Assigned:</span>
                <span className="font-bold text-slate-900">
                  {Object.keys(selectedStaff).length > 0
                    ? Object.keys(selectedStaff)
                        .map((id) => {
                          const s = availableStaff.find((st) => st.staffId === Number(id));
                          return `${s?.name} (${s?.role})`;
                        })
                        .join(", ")
                    : "None assigned"}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-500 block">Invited Participants:</span>
                <span className="font-bold text-slate-900">
                  {selectedAttendees.length > 0
                    ? selectedAttendees
                        .map((id) => users.find((u) => u.userId === id)?.name)
                        .join(", ")
                    : "None"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(3)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              variant="success"
              onClick={handleSubmit}
              isLoading={submitting}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Confirm & Book Meeting
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
