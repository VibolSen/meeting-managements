"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Repeat,
} from "lucide-react";
import {
  api,
  Room,
  RoomAvailability,
  Material,
  Staff,
  User,
  MeetingCreateRequest,
  RecurringMeetingCreateRequest,
  RecurringPreviewResponse,
  RecurrenceType,
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

  // Dynamic Corporate Policy State from Backend System Settings
  const [policies, setPolicies] = useState<{
    operatingHoursStart: string;
    operatingHoursEnd: string;
    maxAdvanceDays: number;
    allowWeekend: boolean;
    defaultDurationMin: number;
  }>({
    operatingHoursStart: "08:00",
    operatingHoursEnd: "18:00",
    maxAdvanceDays: 60,
    allowWeekend: false,
    defaultDurationMin: 30,
  });

  // Recurring Meeting Engine State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("WEEKLY");
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<string[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [occurrencesCount, setOccurrencesCount] = useState<number>(4);
  const [skipConflictedDates, setSkipConflictedDates] = useState(true);
  const [recurrencePreview, setRecurrencePreview] = useState<RecurringPreviewResponse | null>(null);
  const [checkingRecurrence, setCheckingRecurrence] = useState(false);

  // Initial Data Load
  useEffect(() => {
    Promise.all([
      api.rooms.getAll().catch(() => []),
      api.materials.getAll().catch(() => []),
      api.users.getAll().catch(() => []),
      api.systemSettings.getPublic().catch(() => []),
    ]).then(([roomsData, materialsData, usersData, settingsData]) => {
      setRooms(roomsData);
      setMaterials(materialsData);
      setUsers(usersData);
      if (initialRoomId) setSelectedRoomId(initialRoomId);
      if (currentUser?.userId) setOrganizerId(currentUser.userId);

      if (Array.isArray(settingsData) && settingsData.length > 0) {
        const map: Record<string, string> = {};
        settingsData.forEach((s) => {
          map[s.settingKey] = s.settingValue;
        });
        const opStart = map["booking.operating_hours_start"] || "08:00";
        const opEnd = map["booking.operating_hours_end"] || "18:00";
        const maxDays = parseInt(map["booking.max_advance_days"] || "60", 10);
        const allowWk = map["booking.allow_weekend_booking"] === "true";
        const defDur = parseInt(map["scheduling.default_duration_min"] || "30", 10);

        setPolicies({
          operatingHoursStart: opStart,
          operatingHoursEnd: opEnd,
          maxAdvanceDays: maxDays,
          allowWeekend: allowWk,
          defaultDurationMin: defDur,
        });

        // If no initial custom start time passed, seed with operating hours start
        if (!initialStartTime) {
          setStartTime(opStart);
          if (!initialEndTime) {
            const [h, m] = opStart.split(":").map(Number);
            const total = h * 60 + m + defDur;
            const endH = Math.floor(total / 60);
            const endM = total % 60;
            setEndTime(`${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`);
          }
        }
      }
    });
  }, [initialRoomId, currentUser, initialStartTime, initialEndTime]);

  // Synchronize state when slot booking initial props change
  useEffect(() => {
    if (initialDate) setDate(initialDate);
    if (initialStartTime) setStartTime(initialStartTime);
    if (initialEndTime) setEndTime(initialEndTime);
    if (initialRoomId) setSelectedRoomId(initialRoomId);
  }, [initialDate, initialStartTime, initialEndTime, initialRoomId]);

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

  // Policy validation helpers
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (policies.maxAdvanceDays || 60));
    return d.toISOString().split("T")[0];
  }, [policies.maxAdvanceDays]);

  const isSelectedDateWeekend = useMemo(() => {
    if (!date) return false;
    const parts = date.split("-").map(Number);
    if (parts.length < 3) return false;
    const day = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
    return day === 0 || day === 6;
  }, [date]);

  // Step 1 Validation
  const validateStep1 = () => {
    if (!title.trim()) {
      toast.error("Title required", "Please enter a meeting title.");
      return false;
    }
    if (!date) {
      toast.error("Date required", "Please select a date for the meeting.");
      return false;
    }
    if (date < todayStr) {
      toast.error("Date in Past", "Meeting date cannot be in the past.");
      return false;
    }
    if (date > maxDateStr) {
      toast.error(
        "Booking Window Exceeded",
        `Corporate policy allows scheduling up to ${policies.maxAdvanceDays} days in advance.`
      );
      return false;
    }
    if (isSelectedDateWeekend && !policies.allowWeekend) {
      toast.error(
        "Weekend Restricted",
        "Weekend bookings are restricted per company facility policies. Please choose a weekday."
      );
      return false;
    }
    const { startIso, endIso } = getIsoTimestamps();
    if (new Date(startIso) >= new Date(endIso)) {
      toast.error("Invalid Times", "Start time must be strictly before end time.");
      return false;
    }
    if (startTime < policies.operatingHoursStart) {
      toast.error(
        "Outside Operating Hours",
        `Facility opens at ${policies.operatingHoursStart}. Please choose a time within operating hours.`
      );
      return false;
    }
    if (endTime > policies.operatingHoursEnd) {
      toast.error(
        "Outside Operating Hours",
        `Facility closes at ${policies.operatingHoursEnd}. Please choose a time within operating hours.`
      );
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

  const handlePreviewRecurrence = async (roomIdToUse = selectedRoomId) => {
    if (!roomIdToUse) {
      toast.warning("Room Required", "Please select a room to preview series availability.");
      return;
    }
    const { startIso, endIso } = getIsoTimestamps();
    setCheckingRecurrence(true);
    try {
      const preview = await api.meetings.previewRecurring({
        title: title || "Scheduled Series",
        organizerId,
        roomId: roomIdToUse,
        startTime: startIso,
        endTime: endIso,
        recurrenceType,
        repeatInterval,
        daysOfWeek: selectedDaysOfWeek.join(","),
        endDate: recurrenceEndDate || undefined,
        occurrencesCount: occurrencesCount || undefined,
        skipConflictedDates,
      });
      setRecurrencePreview(preview);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error("Preview Failed", errorObj?.message || "Could not preview series availability.");
    } finally {
      setCheckingRecurrence(false);
    }
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
      if (isRecurring) {
        const recurringPayload: RecurringMeetingCreateRequest = {
          ...payload,
          recurrenceType,
          repeatInterval,
          daysOfWeek: selectedDaysOfWeek.join(","),
          endDate: recurrenceEndDate || undefined,
          occurrencesCount,
          skipConflictedDates,
        };
        const series = await api.meetings.createRecurring(recurringPayload);
        toast.success(
          "Recurring Series Confirmed!",
          `Successfully scheduled ${series.length} recurring meeting sessions.`
        );
      } else {
        const result = await api.meetings.create(payload);
        if (result.status === "PENDING") {
          toast.warning(
            "Submitted for Approval",
            "Boardroom booking (cap >= 20) routed to Admin queue."
          );
        } else {
          toast.success("Meeting Confirmed!", "Your meeting room has been successfully reserved.");
        }
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
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-700 h-8"
          leftIcon={<X className="w-4 h-4" />}
        >
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
                min={todayStr}
                max={maxDateStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Advance window: up to {policies.maxAdvanceDays} days</span>
                {!policies.allowWeekend && <span>Mon – Fri only</span>}
              </div>
              {isSelectedDateWeekend && !policies.allowWeekend && (
                <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Weekend reservations are restricted per corporate policy.</span>
                </div>
              )}
            </div>

            <div>
              <Input
                label="Start Time"
                type="time"
                value={startTime}
                min={policies.operatingHoursStart}
                max={policies.operatingHoursEnd}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setStartTime(newStart);
                  if (newStart && (!endTime || endTime <= newStart)) {
                    const [h, m] = newStart.split(":").map(Number);
                    const total = h * 60 + m + (policies.defaultDurationMin || 30);
                    const endH = Math.floor(total / 60);
                    const endM = total % 60;
                    const calculatedEnd = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
                    if (calculatedEnd <= policies.operatingHoursEnd) {
                      setEndTime(calculatedEnd);
                    }
                  }
                }}
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Opens: {policies.operatingHoursStart}
              </span>
            </div>

            <div>
              <Input
                label="End Time"
                type="time"
                value={endTime}
                min={policies.operatingHoursStart}
                max={policies.operatingHoursEnd}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Closes: {policies.operatingHoursEnd} (default {policies.defaultDurationMin}m)
              </span>
            </div>

            {/* Recurring Series Option */}
            <div className="sm:col-span-2 pt-2 border-t border-slate-100">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-xs text-slate-800">
                      Recurring Meeting Series
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                      Auto-Schedule Standups & Syncs
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => {
                        setIsRecurring(e.target.checked);
                        if (!e.target.checked) setRecurrencePreview(null);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {isRecurring && (
                  <div className="space-y-3 pt-2 border-t border-slate-200/80 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Frequency
                        </label>
                        <select
                          value={recurrenceType}
                          onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                          className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="DAILY">Daily</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="BI_WEEKLY">Every 2 Weeks (Bi-weekly)</option>
                          <option value="MONTHLY">Monthly</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Repeat Every
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            max={12}
                            value={repeatInterval}
                            onChange={(e) => setRepeatInterval(Math.max(1, Number(e.target.value)))}
                            className="w-20 text-xs rounded-lg border border-slate-200 bg-white p-2 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-xs text-slate-500">
                            {recurrenceType === "DAILY" ? "day(s)" : recurrenceType === "MONTHLY" ? "month(s)" : "week(s)"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Total Sessions
                        </label>
                        <input
                          type="number"
                          min={2}
                          max={30}
                          value={occurrencesCount}
                          onChange={(e) => setOccurrencesCount(Math.max(2, Number(e.target.value)))}
                          className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g. 4 meetings"
                        />
                      </div>
                    </div>

                    {recurrenceType === "WEEKLY" && (
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                          Repeat on Days of Week
                        </label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((d) => {
                            const isWeekendDay = d === "SATURDAY" || d === "SUNDAY";
                            if (isWeekendDay && !policies.allowWeekend) return null;
                            const isSelected = selectedDaysOfWeek.includes(d);
                            return (
                              <button
                                key={d}
                                type="button"
                                onClick={() => {
                                  setSelectedDaysOfWeek((prev) =>
                                    prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
                                  );
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                                  isSelected
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {d.slice(0, 3)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={skipConflictedDates}
                          onChange={(e) => setSkipConflictedDates(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Skip dates with room conflicts (keep available dates)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button
              variant="primary"
              size="sm"
              className="h-8.5 px-4 font-semibold shadow-indigo-600/20"
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

          {/* Recurring Schedule Preview Inspection */}
          {isRecurring && selectedRoomId && (
            <div className="p-4 rounded-2xl border border-indigo-200/90 bg-indigo-50/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Repeat className="w-4 h-4 text-indigo-600" />
                    Recurring Series Conflict Verification
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Verify room availability across all {occurrencesCount} occurrences in {rooms.find(r => r.roomId === selectedRoomId)?.name}.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreviewRecurrence(selectedRoomId)}
                  isLoading={checkingRecurrence}
                  className="bg-white text-xs h-7.5 px-3 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  Verify All Occurrences
                </Button>
              </div>

              {recurrencePreview && (
                <div className="space-y-2 pt-2 border-t border-indigo-100">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-slate-700">
                      Total: {recurrencePreview.totalGenerated} dates
                    </span>
                    <span className="text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full text-[11px]">
                      {recurrencePreview.clearCount} Clear
                    </span>
                    {recurrencePreview.conflictCount > 0 && (
                      <span className="text-rose-700 font-semibold bg-rose-100/70 px-2 py-0.5 rounded-full text-[11px]">
                        {recurrencePreview.conflictCount} Conflicts Detected
                      </span>
                    )}
                  </div>

                  <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 text-xs">
                    {recurrencePreview.slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`p-2 px-3 flex items-center justify-between gap-2 ${
                          slot.isAvailable ? "hover:bg-slate-50" : "bg-rose-50/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400">
                            #{idx + 1}
                          </span>
                          <span className="font-medium text-slate-800">
                            {new Date(slot.startTime).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {slot.startTime.slice(11, 16)} - {slot.endTime.slice(11, 16)}
                          </span>
                        </div>
                        <div>
                          {slot.isAvailable ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              {slot.conflictReason || "Conflict"}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              className="h-8.5 px-4 font-semibold"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="h-8.5 px-4 font-semibold shadow-indigo-600/20"
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
              size="sm"
              className="h-8.5 px-4 font-semibold"
              onClick={() => setCurrentStep(2)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="h-8.5 px-4 font-semibold shadow-indigo-600/20"
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
              size="sm"
              className="h-8.5 px-4 font-semibold"
              onClick={() => setCurrentStep(3)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              variant="success"
              size="sm"
              className="h-8.5 px-4 font-semibold shadow-emerald-600/20"
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
