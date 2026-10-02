"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Layers,
  Wrench,
  Building,
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  Package,
  UserCheck,
  MapPin,
  Users,
  Box,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import {
  api,
  Room,
  Material,
  Staff,
  User,
  RoomStatus,
  MaterialType,
  StaffRole,
  StaffAvailability,
} from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";

interface ResourcesViewProps {
  currentUser?: User | null;
  initialTab?: ResourceTab;
}

type ResourceTab = "rooms" | "materials" | "staff";

export function ResourcesView({ currentUser = null, initialTab = "rooms" }: ResourcesViewProps = {}) {
  const toast = useToast();
  const { user: authUser } = useAuth();
  const effectiveUser = currentUser || authUser;
  const isAdmin = effectiveUser?.role === "ADMIN";

  const [activeTab, setActiveTab] = useState<ResourceTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // Modal States
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Global Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: "danger" | "warning" | "primary";
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "danger",
    confirmText: "Delete",
    onConfirm: () => {},
  });

  // Form states for creating/editing
  const [roomForm, setRoomForm] = useState<{
    roomId?: number;
    name: string;
    location: string;
    capacity: number;
    status: RoomStatus;
  }>({
    name: "",
    location: "",
    capacity: 10,
    status: "ACTIVE",
  });

  const [materialForm, setMaterialForm] = useState<{
    materialId?: number;
    name: string;
    type: MaterialType;
    quantityAvailable: number;
  }>({
    name: "",
    type: "EQUIPMENT",
    quantityAvailable: 10,
  });

  const [staffForm, setStaffForm] = useState<{
    staffId?: number;
    name: string;
    role: StaffRole;
    skill: string;
    availabilityStatus: StaffAvailability;
  }>({
    name: "",
    role: "TECHNICIAN",
    skill: "",
    availabilityStatus: "AVAILABLE",
  });

  // Load all resource data
  const loadResources = async () => {
    setLoading(true);
    try {
      const [roomsData, materialsData, staffData] = await Promise.all([
        api.rooms.getAll(),
        api.materials.getAll(),
        api.staff.getAll(),
      ]);
      setRooms(roomsData);
      setMaterials(materialsData);
      setStaffList(staffData);
    } catch {
      toast.error("Failed to load resources", "Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // ----------------- ROOM ACTIONS -----------------
  const handleOpenRoomModal = (room?: Room) => {
    if (room) {
      setRoomForm({
        roomId: room.roomId,
        name: room.name,
        location: room.location,
        capacity: room.capacity,
        status: room.status,
      });
    } else {
      setRoomForm({
        name: "",
        location: "",
        capacity: 10,
        status: "ACTIVE",
      });
    }
    setRoomModalOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.name.trim() || !roomForm.location.trim()) {
      toast.warning("Validation Error", "Please fill in all room fields.");
      return;
    }

    setActionLoading(true);
    try {
      if (roomForm.roomId) {
        await api.rooms.update(roomForm.roomId, {
          name: roomForm.name,
          location: roomForm.location,
          capacity: Number(roomForm.capacity),
          status: roomForm.status,
        });
        toast.success("Room Updated", `${roomForm.name} details saved.`);
      } else {
        await api.rooms.create({
          name: roomForm.name,
          location: roomForm.location,
          capacity: Number(roomForm.capacity),
          status: roomForm.status,
        });
        toast.success("Room Created", `${roomForm.name} added to facilities.`);
      }
      setRoomModalOpen(false);
      await loadResources();
    } catch {
      toast.error("Operation Failed", "Could not save room details.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleRoomStatus = async (room: Room) => {
    const nextStatus: RoomStatus =
      room.status === "ACTIVE" ? "UNDER_MAINTENANCE" : "ACTIVE";
    setActionLoading(true);
    try {
      await api.rooms.update(room.roomId, { status: nextStatus });
      toast.success(
        "Status Changed",
        `${room.name} is now ${nextStatus === "ACTIVE" ? "Operational" : "Under Maintenance"}.`
      );
      await loadResources();
    } catch {
      toast.error("Failed", "Could not update room status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRoom = (roomId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Meeting Room",
      message: "Are you sure you want to permanently delete this room? This action cannot be undone.",
      variant: "danger",
      confirmText: "Delete Room",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await api.rooms.delete(roomId);
          toast.success("Room Removed", "Room deleted successfully.");
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await loadResources();
        } catch {
          toast.error("Deletion Blocked", "Cannot delete room with active bookings.");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // ----------------- MATERIAL ACTIONS -----------------
  const handleOpenMaterialModal = (material?: Material) => {
    if (material) {
      setMaterialForm({
        materialId: material.materialId,
        name: material.name,
        type: material.type,
        quantityAvailable: material.quantityAvailable,
      });
    } else {
      setMaterialForm({
        name: "",
        type: "EQUIPMENT",
        quantityAvailable: 10,
      });
    }
    setMaterialModalOpen(true);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.name.trim()) {
      toast.warning("Validation Error", "Please provide a material name.");
      return;
    }

    setActionLoading(true);
    try {
      if (materialForm.materialId) {
        await api.materials.update(materialForm.materialId, {
          name: materialForm.name,
          type: materialForm.type,
          quantityAvailable: Number(materialForm.quantityAvailable),
        });
        toast.success("Item Updated", `${materialForm.name} inventory updated.`);
      } else {
        await api.materials.create({
          name: materialForm.name,
          type: materialForm.type,
          quantityAvailable: Number(materialForm.quantityAvailable),
        });
        toast.success("Item Added", `${materialForm.name} added to inventory.`);
      }
      setMaterialModalOpen(false);
      await loadResources();
    } catch {
      toast.error("Failed", "Could not save material.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickAdjustStock = async (material: Material, delta: number) => {
    const newQty = Math.max(0, material.quantityAvailable + delta);
    setActionLoading(true);
    try {
      await api.materials.update(material.materialId, { quantityAvailable: newQty });
      toast.success("Stock Adjusted", `${material.name}: ${newQty} units`);
      await loadResources();
    } catch {
      toast.error("Failed", "Could not update stock.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMaterial = (materialId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Material Item",
      message: "Are you sure you want to remove this material item from the equipment catalog?",
      variant: "danger",
      confirmText: "Delete Item",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await api.materials.delete(materialId);
          toast.success("Item Removed", "Material deleted from catalog.");
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await loadResources();
        } catch {
          toast.error("Failed", "Cannot delete item assigned to active meetings.");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // ----------------- STAFF ACTIONS -----------------
  const handleOpenStaffModal = (staff?: Staff) => {
    if (staff) {
      setStaffForm({
        staffId: staff.staffId,
        name: staff.name,
        role: staff.role,
        skill: staff.skill || "",
        availabilityStatus: staff.availabilityStatus,
      });
    } else {
      setStaffForm({
        name: "",
        role: "TECHNICIAN",
        skill: "",
        availabilityStatus: "AVAILABLE",
      });
    }
    setStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim()) {
      toast.warning("Validation Error", "Please provide staff member name.");
      return;
    }

    setActionLoading(true);
    try {
      if (staffForm.staffId) {
        await api.staff.update(staffForm.staffId, {
          name: staffForm.name,
          role: staffForm.role,
          skill: staffForm.skill,
          availabilityStatus: staffForm.availabilityStatus,
        });
        toast.success("Staff Profile Updated", `${staffForm.name} updated.`);
      } else {
        await api.staff.create({
          name: staffForm.name,
          role: staffForm.role,
          skill: staffForm.skill,
          availabilityStatus: staffForm.availabilityStatus,
        });
        toast.success("Staff Enrolled", `${staffForm.name} added to roster.`);
      }
      setStaffModalOpen(false);
      await loadResources();
    } catch {
      toast.error("Failed", "Could not save staff member.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStaffStatus = async (staff: Staff) => {
    const nextStatus: StaffAvailability =
      staff.availabilityStatus === "AVAILABLE" ? "OFF_DUTY" : "AVAILABLE";
    setActionLoading(true);
    try {
      await api.staff.update(staff.staffId, { availabilityStatus: nextStatus });
      toast.success(
        "Roster Updated",
        `${staff.name} is now ${nextStatus === "AVAILABLE" ? "Available" : "Off Duty"}.`
      );
      await loadResources();
    } catch {
      toast.error("Failed", "Could not change staff availability.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStaff = (staffId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Remove Staff Member",
      message: "Are you sure you want to remove this staff member from the roster? This cannot be undone.",
      variant: "danger",
      confirmText: "Remove Staff",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await api.staff.delete(staffId);
          toast.success("Staff Member Removed", "Removed from staff roster.");
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await loadResources();
        } catch {
          toast.error("Failed", "Cannot delete staff currently assigned to meetings.");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Filtered queries
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const q = searchQuery.toLowerCase();
    return rooms.filter(
      (r) => r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q)
    );
  }, [rooms, searchQuery]);

  const filteredMaterials = useMemo(() => {
    if (!searchQuery.trim()) return materials;
    const q = searchQuery.toLowerCase();
    return materials.filter(
      (m) => m.name.toLowerCase().includes(q) || m.type.toLowerCase().includes(q)
    );
  }, [materials, searchQuery]);

  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staffList;
    const q = searchQuery.toLowerCase();
    return staffList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.skill?.toLowerCase().includes(q)
    );
  }, [staffList, searchQuery]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-purple-50/70 via-white to-slate-50 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Resources & Logistics Administration
            </span>
            {isAdmin ? (
              <Badge variant="confirmed" size="sm">Admin Access</Badge>
            ) : (
              <Badge variant="neutral" size="sm">Read Only</Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage facilities, room statuses, AV & catering inventories, and support personnel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadResources}
            isLoading={loading}
            className="h-8.5 text-xs px-3"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>

          {isAdmin && (
            <>
              {activeTab === "rooms" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenRoomModal()}
                  className="h-10 text-xs gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Room
                </Button>
              )}
              {activeTab === "materials" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenMaterialModal()}
                  className="h-10 text-xs gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Material
                </Button>
              )}
              {activeTab === "staff" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenStaffModal()}
                  className="h-10 text-xs gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Staff
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 border border-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("rooms")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              activeTab === "rooms"
                ? "bg-white text-indigo-600 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Rooms ({rooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("materials")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              activeTab === "materials"
                ? "bg-white text-indigo-600 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Materials ({materials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("staff")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all cursor-pointer ${
              activeTab === "staff"
                ? "bg-white text-indigo-600 font-bold shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Staff Roster ({staffList.length})</span>
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* ---------------- SUB-TAB 1: ROOMS ---------------- */}
      {activeTab === "rooms" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => {
            const isBoardroom = room.capacity >= 20;

            return (
              <Card
                key={room.roomId}
                className="p-5 border-slate-200 bg-white flex flex-col justify-between hover:border-indigo-300 transition-all group shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {room.name}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {room.location}
                      </p>
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
                      {room.status === "ACTIVE" ? "Available" : "Maintenance"}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      Seating Capacity
                    </span>
                    <span className="font-bold text-slate-900">{room.capacity} Persons</span>
                  </div>

                  {isBoardroom && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>Executive Boardroom &bull; Requires Admin Approval</span>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => handleToggleRoomStatus(room)}
                      className="text-slate-600 hover:text-indigo-600 font-medium cursor-pointer transition-colors"
                    >
                      {room.status === "ACTIVE" ? "Flag Maintenance" : "Set Active"}
                    </button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenRoomModal(room)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        title="Edit Room"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRoom(room.roomId)}
                        className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete Room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ---------------- SUB-TAB 2: MATERIALS ---------------- */}
      {activeTab === "materials" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((mat) => {
            const isLowStock = mat.quantityAvailable < 5;

            return (
              <Card
                key={mat.materialId}
                className="p-5 border-slate-200 bg-white flex flex-col justify-between hover:border-indigo-300 transition-all group shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {mat.name}
                      </h4>
                      <Badge variant="neutral" className="mt-1">
                        {mat.type}
                      </Badge>
                    </div>

                    <Badge variant={isLowStock ? "pending" : "available"}>
                      {isLowStock ? "Low Stock" : "In Stock"}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Box className="w-3.5 h-3.5 text-cyan-600" />
                      Units Available
                    </span>
                    <span className="text-base font-mono font-bold text-slate-900">
                      {mat.quantityAvailable}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                    {/* Quick +/- Stock Buttons */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 text-[11px] font-semibold mr-1">Stock:</span>
                      <button
                        onClick={() => handleQuickAdjustStock(mat, -1)}
                        className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="Deduct 1"
                      >
                        <MinusCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleQuickAdjustStock(mat, 1)}
                        className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="Add 1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenMaterialModal(mat)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMaterial(mat.materialId)}
                        className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ---------------- SUB-TAB 3: STAFF ---------------- */}
      {activeTab === "staff" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => (
            <Card
              key={staff.staffId}
              className="p-5 border-slate-200 bg-white flex flex-col justify-between hover:border-indigo-300 transition-all group shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {staff.name}
                    </h4>
                    <p className="text-xs text-indigo-600 font-bold mt-0.5 uppercase tracking-wider">
                      {staff.role}
                    </p>
                  </div>

                  <Badge
                    variant={
                      staff.availabilityStatus === "AVAILABLE"
                        ? "available"
                        : staff.availabilityStatus === "ASSIGNED"
                        ? "pending"
                        : "neutral"
                    }
                  >
                    {staff.availabilityStatus}
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">
                    Skills & Specialization
                  </span>
                  <p className="text-slate-700 font-medium">{staff.skill || "Standard operations"}</p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => handleToggleStaffStatus(staff)}
                    className="text-slate-600 hover:text-indigo-600 font-medium cursor-pointer transition-colors"
                  >
                    {staff.availabilityStatus === "AVAILABLE" ? "Mark Off Duty" : "Mark Available"}
                  </button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenStaffModal(staff)}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStaff(staff.staffId)}
                      className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      title="Delete Staff"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ---------------- MODAL 1: ADD / EDIT ROOM ---------------- */}
      <Modal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        title={roomForm.roomId ? "Edit Room Details" : "Add New Room Facility"}
        description="Configure conference room specifications and operational status."
        maxWidth="md"
      >
        <form onSubmit={handleSaveRoom} className="space-y-4">
          <Input
            label="Room Name"
            value={roomForm.name}
            onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
            placeholder="e.g., Executive Boardroom, Alpha Lab"
            required
          />

          <Input
            label="Location / Floor"
            value={roomForm.location}
            onChange={(e) => setRoomForm({ ...roomForm, location: e.target.value })}
            placeholder="e.g., Floor 4, West Wing"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Seating Capacity"
              type="number"
              min={1}
              max={200}
              value={roomForm.capacity}
              onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
              helperText="Capacity >= 20 requires Admin approval"
              required
            />

            <Select
              label="Operational Status"
              value={roomForm.status}
              onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value as RoomStatus })}
            >
              <option value="ACTIVE">Active (Bookable)</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setRoomModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={actionLoading}
              className="text-xs"
            >
              Save Room
            </Button>
          </div>
        </form>
      </Modal>

      {/* ---------------- MODAL 2: ADD / EDIT MATERIAL ---------------- */}
      <Modal
        isOpen={materialModalOpen}
        onClose={() => setMaterialModalOpen(false)}
        title={materialForm.materialId ? "Edit Inventory Item" : "Add Inventory Item"}
        description="Catalog equipment, stationery, or catering items for meeting logistics."
        maxWidth="md"
      >
        <form onSubmit={handleSaveMaterial} className="space-y-4">
          <Input
            label="Item Name"
            value={materialForm.name}
            onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
            placeholder="e.g., 4K Projector, Wireless Microphones"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Material Category"
              value={materialForm.type}
              onChange={(e) =>
                setMaterialForm({ ...materialForm, type: e.target.value as MaterialType })
              }
            >
              <option value="EQUIPMENT">AV Equipment</option>
              <option value="STATIONERY">Stationery / Whiteboard</option>
              <option value="CATERING">Catering / Hospitality</option>
            </Select>

            <Input
              label="Quantity in Stock"
              type="number"
              min={0}
              max={1000}
              value={materialForm.quantityAvailable}
              onChange={(e) =>
                setMaterialForm({
                  ...materialForm,
                  quantityAvailable: Number(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setMaterialModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={actionLoading}
              className="text-xs"
            >
              Save Material
            </Button>
          </div>
        </form>
      </Modal>

      {/* ---------------- MODAL 3: ADD / EDIT STAFF ---------------- */}
      <Modal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        title={staffForm.staffId ? "Edit Staff Profile" : "Enroll Support Staff"}
        description="Manage on-site support personnel qualifications and roles."
        maxWidth="md"
      >
        <form onSubmit={handleSaveStaff} className="space-y-4">
          <Input
            label="Full Name"
            value={staffForm.name}
            onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
            placeholder="e.g., David Chen, Sarah Connor"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Assigned Role"
              value={staffForm.role}
              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as StaffRole })}
            >
              <option value="TECHNICIAN">Technician (IT / AV)</option>
              <option value="RECEPTIONIST">Receptionist (Host)</option>
              <option value="FACILITATOR">Facilitator (Moderator)</option>
            </Select>

            <Select
              label="Availability Status"
              value={staffForm.availabilityStatus}
              onChange={(e) =>
                setStaffForm({
                  ...staffForm,
                  availabilityStatus: e.target.value as StaffAvailability,
                })
              }
            >
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="OFF_DUTY">Off Duty</option>
            </Select>
          </div>

          <Input
            label="Skills & Expertise"
            value={staffForm.skill}
            onChange={(e) => setStaffForm({ ...staffForm, skill: e.target.value })}
            placeholder="e.g., Polycom setup, soundboard mixing, guest registration"
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setStaffModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={actionLoading}
              className="text-xs"
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Global Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => !actionLoading && setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        isLoading={actionLoading}
      />
    </div>
  );
}
