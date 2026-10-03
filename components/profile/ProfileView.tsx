"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { User, Department, api } from "@/lib/api";
import { UserAvatar } from "@/components/users/UserAvatar";
import { UserRoleBadge } from "@/components/users/UserRoleBadge";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { Button } from "@/components/ui/button";
import { ProfileEditModal } from "./ProfileEditModal";
import { ProfileSecurityModal } from "./ProfileSecurityModal";
import { useToast } from "@/components/Toast";
import {
  Edit3,
  KeyRound,
  Mail,
  Building,
  User as UserIcon,
  Lock,
} from "lucide-react";

interface ProfileViewProps {
  initialUser?: User | null;
  preferredRole?: "ADMIN" | "ORGANIZER" | "EMPLOYEE";
}

export function ProfileView({ initialUser, preferredRole }: ProfileViewProps = {}) {
  const { user: authUser } = useAuth();
  const toast = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(initialUser || authUser);
  const [loading, setLoading] = useState(true);

  // Dynamic API state
  const [departments, setDepartments] = useState<Department[]>([]);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  // Load user details and departments
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, deptsData] = await Promise.all([
        api.users.getAll().catch(() => []),
        api.departments.getAll().catch(() => []),
      ]);

      setDepartments(deptsData || []);

      // Determine profile user
      if (initialUser) {
        setCurrentUser(initialUser);
      } else if (authUser && (!preferredRole || authUser.role === preferredRole)) {
        setCurrentUser(authUser);
      } else if (preferredRole && usersData && usersData.length > 0) {
        const roleMatch = usersData.find((u) => u.role === preferredRole);
        setCurrentUser(roleMatch || authUser || usersData[0]);
      } else if (authUser) {
        setCurrentUser(authUser);
      } else if (usersData && usersData.length > 0) {
        setCurrentUser(usersData[0]);
      }
    } catch {
      toast.error("Data Load Error", "Error loading profile details from server");
    } finally {
      setLoading(false);
    }
  }, [authUser, initialUser, preferredRole, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUserUpdated = (updated: User) => {
    setCurrentUser(updated);
    toast.success("Profile Updated", "Your profile details have been saved successfully");
  };

  // Department name resolution
  const departmentName = useMemo(() => {
    if (!currentUser) return "General Operations";
    const dept = departments.find((d) => d.departmentId === currentUser.departmentId);
    return dept?.name || currentUser.departmentName || "General Operations";
  }, [currentUser, departments]);

  if (loading && !currentUser) {
    return (
      <div className="space-y-5 animate-pulse max-w-5xl mx-auto">
        <div className="h-44 rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 rounded-2xl bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-lg mx-auto">
        <h3 className="text-sm font-bold text-slate-800">Profile Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">Please sign in to view your profile information.</p>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* 1. Profile Identity Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Identity Info */}
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <div className="relative group shrink-0">
              <div className="p-1 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 shadow-xs">
                <UserAvatar
                  name={currentUser.name}
                  avatarUrl={currentUser.avatarUrl}
                  size="xl"
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl ring-2 ring-white shadow-inner"
                />
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs border-2 border-white transition-transform active:scale-95 cursor-pointer"
                title="Edit Profile Avatar"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
                  {currentUser.name}
                </h1>
                <UserRoleBadge role={currentUser.role} />
                {currentUser.status && <UserStatusBadge status={currentUser.status} />}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{departmentName}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Profile Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSecurityModalOpen(true)}
              className="h-9 text-xs px-3 bg-white"
              leftIcon={<KeyRound className="w-3.5 h-3.5" />}
            >
              Change Password
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="h-9 text-xs px-3.5 shadow-indigo-600/20"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Card: Personal Information */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>
                <p className="text-[11px] text-slate-400">Basic identification details</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Full Name</span>
              <span className="font-semibold text-slate-900">{currentUser.name}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Email Address</span>
              <span className="font-semibold text-slate-900 font-mono text-[11px]">{currentUser.email}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Department</span>
              <span className="font-semibold text-slate-900">{departmentName}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Account Role</span>
              <UserRoleBadge role={currentUser.role} />
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500 font-medium">Account Status</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {currentUser.status || "ACTIVE"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Security & Authentication */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Security & Credentials</h2>
                <p className="text-[11px] text-slate-400">Password and authentication settings</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSecurityModalOpen(true)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              Update
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <div>
                <span className="text-slate-500 font-medium block">Account Password</span>
                <span className="text-[11px] text-slate-400 font-mono tracking-widest">••••••••••••</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSecurityModalOpen(true)}
                className="h-7 text-[11px] px-2.5"
              >
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Auth Provider</span>
              <span className="font-semibold text-slate-800">Email & Password (JWT)</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Session Status</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active Session
              </span>
            </div>

            <div className="py-2">
              <span className="text-slate-500 font-medium block mb-1">Role Permissions Scope</span>
              <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                {currentUser.role === "ADMIN" && (
                  <><strong>Administrator:</strong> Full system administrative authority, including user management, department configuration, resource inventory, and boardroom approvals.</>
                )}
                {currentUser.role === "ORGANIZER" && (
                  <><strong>Organizer:</strong> Permissions to schedule meetings, check boardroom availability, manage attendee invitations, and coordinate conference sessions.</>
                )}
                {currentUser.role === "EMPLOYEE" && (
                  <><strong>Employee:</strong> Access to view organization meeting schedules, receive calendar invitations, and submit RSVP responses.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={currentUser}
        departments={departments}
        onUserUpdated={handleUserUpdated}
      />

      {/* Security / Password Modal */}
      <ProfileSecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        user={currentUser}
      />
    </div>
  );
}

export default ProfileView;
