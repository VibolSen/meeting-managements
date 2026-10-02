import React, { useState } from "react";
import { UserStatus } from "@/lib/api";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  status?: UserStatus;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showStatusIndicator?: boolean;
}

const SIZE_MAP = {
  xs: "w-7 h-7 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl font-bold",
};

const STATUS_SIZE_MAP = {
  xs: "w-2 h-2 ring-1",
  sm: "w-2.5 h-2.5 ring-1.5",
  md: "w-3 h-3 ring-2",
  lg: "w-3.5 h-3.5 ring-2",
  xl: "w-4 h-4 ring-2",
};

// Generates consistent smooth pastel gradients from name
const GRADIENTS = [
  "from-indigo-500 to-purple-600 text-white",
  "from-blue-500 to-cyan-600 text-white",
  "from-violet-500 to-fuchsia-600 text-white",
  "from-rose-500 to-pink-600 text-white",
  "from-amber-500 to-orange-600 text-white",
  "from-emerald-500 to-teal-600 text-white",
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAvatar({
  name,
  avatarUrl,
  status,
  size = "sm",
  className = "",
  showStatusIndicator = false,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const sizeClass = SIZE_MAP[size];
  const gradient = getGradient(name || "User");
  const initials = getInitials(name || "User");

  const hasValidImage = Boolean(avatarUrl && !imageError);

  return (
    <div className={`relative inline-block shrink-0 select-none ${className}`}>
      <div
        className={`${sizeClass} rounded-xl overflow-hidden flex items-center justify-center font-bold shadow-xs transition-transform ${
          hasValidImage ? "bg-slate-100" : `bg-gradient-to-br ${gradient}`
        }`}
      >
        {hasValidImage ? (
          <img
            src={avatarUrl!}
            alt={name}
            className="w-full h-full object-cover rounded-xl"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {showStatusIndicator && status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-white ${
            STATUS_SIZE_MAP[size]
          } ${status === "SUSPENDED" ? "bg-rose-500" : "bg-emerald-500"}`}
          title={`Status: ${status === "SUSPENDED" ? "Suspended" : "Active"}`}
        />
      )}
    </div>
  );
}
