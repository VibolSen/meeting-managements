export interface AppSettings {
  // General & Regional
  timezone: string;
  dateFormat: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY";
  timeFormat: "12h" | "24h";
  weekStart: "monday" | "sunday";
  defaultCalendarView: "day" | "week" | "agenda";

  // Notifications
  notifyNewInvitations: boolean;
  notifyMeetingChanges: boolean;
  notifyCancellations: boolean;
  notifyReminders: boolean;
  emailDigest: "instant" | "daily" | "off";
  notificationSound: boolean;

  // Meeting Defaults
  defaultDurationMinutes: number;
  bufferTimeMinutes: number;
  autoDetectConflicts: boolean;
  defaultMaterials: string[];

  // Admin Policies (Applicable to ADMIN role)
  approvalThresholdCapacity: number;
  maxAdvanceBookingDays: number;
  workingHoursStart: string;
  workingHoursEnd: string;

  // Security
  sessionTimeoutMinutes: number;
  twoFactorEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  // General & Regional
  timezone: "Asia/Phnom_Penh",
  dateFormat: "YYYY-MM-DD",
  timeFormat: "24h",
  weekStart: "monday",
  defaultCalendarView: "week",

  // Notifications
  notifyNewInvitations: true,
  notifyMeetingChanges: true,
  notifyCancellations: true,
  notifyReminders: true,
  emailDigest: "instant",
  notificationSound: true,

  // Meeting Defaults
  defaultDurationMinutes: 30,
  bufferTimeMinutes: 5,
  autoDetectConflicts: true,
  defaultMaterials: ["Projector", "Whiteboard & Markers"],

  // Admin Policies
  approvalThresholdCapacity: 20,
  maxAdvanceBookingDays: 60,
  workingHoursStart: "08:00",
  workingHoursEnd: "18:00",

  // Security
  sessionTimeoutMinutes: 60,
  twoFactorEnabled: false,
};

const SETTINGS_STORAGE_KEY = "mms_user_settings";

export function getStoredSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function setStoredSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to persist user settings to localStorage", e);
  }
}

export function resetStoredSettings(): AppSettings {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  }
  return DEFAULT_SETTINGS;
}
