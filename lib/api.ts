export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// ----------------- TYPE DEFINITIONS -----------------

export type UserRole = "ADMIN" | "ORGANIZER" | "EMPLOYEE";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type BookingAccessLevel = "FULL_ACCESS" | "VIEW_ONLY";
export type RoomStatus = "ACTIVE" | "UNDER_MAINTENANCE" | "INACTIVE";
export type MeetingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type AttendeeResponseStatus = "ACCEPTED" | "DECLINED" | "PENDING";
export type MaterialType = "EQUIPMENT" | "STATIONERY" | "CATERING";
export type StaffRole = "TECHNICIAN" | "RECEPTIONIST" | "FACILITATOR";
export type StaffAvailability = "AVAILABLE" | "ASSIGNED" | "OFF_DUTY";
export type NotificationType = "CONFIRMATION" | "REMINDER" | "CHANGE" | "CANCELLATION";
export type NotificationStatus = "SENT" | "FAILED" | "PENDING" | "READ";

export type SettingCategory =
  | "ROLE_PERMISSIONS"
  | "BOOKING_POLICY"
  | "SCHEDULING_DEFAULTS"
  | "NOTIFICATIONS"
  | "BRANDING"
  | "SECURITY";

export type SettingDataType = "BOOLEAN" | "NUMBER" | "STRING" | "JSON";

export interface SystemSettingItem {
  settingKey: string;
  settingValue: string;
  category: SettingCategory;
  dataType: SettingDataType;
  displayName: string;
  description?: string;
  isPublic: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SystemSettingUpdateItem {
  settingKey: string;
  settingValue: string;
}

export interface Department {
  departmentId: number;
  name: string;
  description?: string;
  memberCount?: number;
}

export interface User {
  userId: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  departmentId?: number;
  departmentName?: string;
  status?: UserStatus;
  bookingAccess?: BookingAccessLevel;
  avatarUrl?: string;
  phone?: string;
  jobTitle?: string;
  createdAt?: string;
  updatedAt?: string;
  telegramChatId?: string;
  telegramUsername?: string;
  telegramReminderMinutes?: number;
  telegramNotificationsEnabled?: boolean;
}

export interface TelegramStatus {
  botEnabled: boolean;
  botUsername: string;
  defaultChatId: string;
  defaultReminderMinutes: number;
  botLink: string;
}

export interface TelegramBotConfig {
  botEnabled: boolean;
  botTokenMasked?: string;
  hasToken: boolean;
  botUsername: string;
  defaultChatId: string;
  defaultReminderMinutes: number;
  botLink: string;
}

export interface TelegramBotConfigUpdate {
  botEnabled?: boolean;
  botToken?: string;
  botUsername?: string;
  defaultChatId?: string;
  defaultReminderMinutes?: number;
}

export interface TelegramValidationResult {
  valid: boolean;
  botId?: number;
  botName?: string;
  username?: string;
  errorMessage?: string;
}

export interface NotificationTemplate {
  templateId?: number;
  type: NotificationType;
  name: string;
  content: string;
  isCustomized: boolean;
  updatedAt?: string;
}

export interface TelegramSettingsPayload {
  telegramChatId?: string;
  telegramUsername?: string;
  telegramReminderMinutes?: number;
  telegramNotificationsEnabled?: boolean;
}

export interface Room {
  roomId: number;
  name: string;
  location: string;
  capacity: number;
  status: RoomStatus;
}

export interface RoomAvailability {
  roomId: number;
  name: string;
  location: string;
  capacity: number;
  status: RoomStatus;
  available: boolean;
  conflictReason?: string | null;
  nextAvailableTime?: string | null;
}

export interface Material {
  materialId: number;
  name: string;
  type: MaterialType;
  quantityAvailable: number;
}

export interface Staff {
  staffId: number;
  name: string;
  role: StaffRole;
  skill?: string;
  availabilityStatus: StaffAvailability;
}

export interface MeetingAttendee {
  userId: number;
  name: string;
  email: string;
  responseStatus: AttendeeResponseStatus;
}

export interface MeetingMaterial {
  materialId: number;
  name: string;
  type: MaterialType;
  quantityRequested: number;
}

export interface MeetingStaff {
  staffId: number;
  name: string;
  role: StaffRole;
  assignedRole?: string;
}

export type RecurrenceType = "NONE" | "DAILY" | "WEEKLY" | "BI_WEEKLY" | "MONTHLY";

export interface RecurringSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  conflictReason?: string;
}

export interface RecurringPreviewResponse {
  totalGenerated: number;
  clearCount: number;
  conflictCount: number;
  slots: RecurringSlot[];
}

export type ActionItemStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface ActionItem {
  itemId: number;
  meetingId: number;
  meetingTitle?: string;
  assignee?: User;
  taskDescription: string;
  dueDate?: string;
  status: ActionItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItemCreateRequest {
  assigneeId?: number;
  taskDescription: string;
  dueDate?: string;
}

export interface MeetingMinutes {
  minutesId: number;
  meetingId: number;
  agenda?: string;
  summary?: string;
  keyDecisions?: string;
  publishedAt?: string;
  publishedBy?: User;
}

export interface MeetingMinutesRequest {
  agenda?: string;
  summary?: string;
  keyDecisions?: string;
  publishedById?: number;
}

export interface MeetingAttachment {
  attachmentId: number;
  meetingId: number;
  fileName: string;
  fileType?: string;
  fileUrl: string;
  fileSize?: number;
  uploadedAt: string;
  uploadedBy?: User;
}

export interface MeetingAttachmentCreateRequest {
  fileName: string;
  fileType?: string;
  fileUrl: string;
  fileSize?: number;
  uploadedById?: number;
}

export interface Meeting {
  meetingId: number;
  title: string;
  purpose?: string;
  status: MeetingStatus;
  startTime: string;
  endTime: string;
  isCheckedIn?: boolean;
  checkedInAt?: string;
  createdAt?: string;
  updatedAt?: string;
  seriesId?: number;
  recurrenceType?: RecurrenceType;
  organizer: User;
  room: Room;
  attendees: MeetingAttendee[];
  materials: MeetingMaterial[];
  staffAssignments: MeetingStaff[];
}

export type RoomIssueCategory =
  | "PROJECTOR_DISPLAY"
  | "VIDEO_CONFERENCE"
  | "AIR_CONDITIONING"
  | "LIGHTING"
  | "CLEANLINESS"
  | "AUDIO_MIC"
  | "OTHER";

export type IssuePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RoomIssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface RoomIssue {
  issueId: number;
  roomId: number;
  roomName?: string;
  reportedById?: number;
  reportedByName?: string;
  reporterName?: string;
  category: RoomIssueCategory;
  priority: IssuePriority;
  title: string;
  description?: string;
  status: RoomIssueStatus;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface RoomIssueCreateRequest {
  roomId?: number;
  reportedById?: number;
  reporterName?: string;
  category: RoomIssueCategory;
  priority: IssuePriority;
  title: string;
  description?: string;
}

export interface RoomIssueUpdateRequest {
  status: RoomIssueStatus;
  resolutionNotes?: string;
}

export interface RoomDisplayStatus {
  room: Room;
  isOccupied: boolean;
  currentMeeting?: Meeting | null;
  nextMeeting?: Meeting | null;
  secondsRemainingInCurrentMeeting?: number | null;
  minutesUntilNextMeeting?: number | null;
  currentTime: string;
  todaySchedule: Meeting[];
  activeIssues: RoomIssue[];
}

export interface RoomUtilization {
  roomId: number;
  roomName: string;
  capacity: number;
  totalMeetings: number;
  totalHours: number;
  utilizationPct: number;
}

export interface DepartmentUsage {
  departmentId?: number;
  departmentName: string;
  totalMeetings: number;
  totalHours: number;
  percentage: number;
}

export interface HeatmapCell {
  dayOfWeek: number;
  dayName: string;
  hour: number;
  meetingCount: number;
  intensity: number;
}

export interface AnalyticsSummary {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  autoReleasedNoShows: number;
  totalMeetingHours: number;
  overallFacilityUtilizationPct: number;
  cancellationRatePct: number;
  noShowRatePct: number;
  roomUtilizations: RoomUtilization[];
  departmentUsages: DepartmentUsage[];
  heatmap: HeatmapCell[];
}

export interface MeetingCreateRequest {
  title: string;
  purpose?: string;
  organizerId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  attendeeIds?: number[];
  materials?: { materialId: number; quantityRequested: number }[];
  staffAssignments?: { staffId: number; assignedRole?: string }[];
}

export interface RecurringMeetingCreateRequest extends MeetingCreateRequest {
  recurrenceType: RecurrenceType;
  repeatInterval?: number;
  daysOfWeek?: string;
  endDate?: string;
  occurrencesCount?: number;
  skipConflictedDates?: boolean;
}

export interface NotificationItem {
  notificationId: number;
  meetingId?: number;
  meetingTitle?: string;
  recipientId: number;
  recipientName?: string;
  type: NotificationType;
  message?: string;
  sentAt?: string;
  status: NotificationStatus;
}

export interface DashboardSummary {
  totalMeetings: number;
  pendingMeetings: number;
  confirmedMeetings: number;
  completedMeetings: number;
  cancelledMeetings: number;
  totalRooms: number;
  activeRooms: number;
  totalStaff: number;
  availableStaff: number;
  totalMaterials: number;
  upcomingMeetings: Meeting[];
}

export interface SystemInfo {
  appName: string;
  version: string;
  builder?: string;
  environment?: string;
  status: string;
  serverTime?: string;
}

export type AuditActionType =
  | "CREATE"
  | "UPDATE"
  | "APPROVE"
  | "CANCEL"
  | "DELETE"
  | "ROLE_CHANGE"
  | "STATUS_CHANGE"
  | "LOGIN";

export type AuditEntityType =
  | "MEETING"
  | "ROOM"
  | "MATERIAL"
  | "STAFF"
  | "USER"
  | "DEPARTMENT"
  | "SYSTEM";

export interface AuditLog {
  logId: number;
  actorId?: number;
  actorName: string;
  actorEmail?: string;
  actionType: AuditActionType;
  entityType: AuditEntityType;
  entityId?: number;
  entityName?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogSummary {
  totalLogs: number;
  logsToday: number;
  approvalActions: number;
  securityActions: number;
  actionDistribution: Record<string, number>;
}

export interface ApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message: string;
  validationErrors?: Record<string, string>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  departmentId?: number;
  status?: UserStatus;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

// ----------------- TOKEN & USER STORAGE HELPERS -----------------

const TOKEN_KEY = "mms_jwt_token";
const USER_KEY = "mms_user_profile";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

// ----------------- GENERIC REQUEST HANDLER -----------------

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `Request failed with status ${response.status}: ${response.statusText}` };
    }
    throw errorData;
  }

  // Handle 204 No Content or empty responses
  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text || !text.trim()) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

// ----------------- API CLIENTS -----------------

export const api = {
  // Authentication & Session
  auth: {
    login: async (data: LoginRequest) => {
      const res = await request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (res.token) {
        setStoredToken(res.token);
      }
      if (res.user) {
        setStoredUser(res.user);
      }
      return res;
    },
    register: async (data: RegisterRequest) => {
      const res = await request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (res.token) {
        setStoredToken(res.token);
      }
      if (res.user) {
        setStoredUser(res.user);
      }
      return res;
    },
    me: () => request<User>("/auth/me"),
    logout: () => {
      setStoredToken(null);
      setStoredUser(null);
    },
  },
  // Dashboard & Metrics
  dashboard: {
    getSummary: () => request<DashboardSummary>("/dashboard/summary"),
  },

  // Rooms
  rooms: {
    getAll: () => request<Room[]>("/rooms"),
    getById: (id: number) => request<Room>(`/rooms/${id}`),
    getDisplayStatus: (roomId: number) => request<RoomDisplayStatus>(`/rooms/${roomId}/display-status`),
    checkAvailability: (id: number, start: string, end: string) =>
      request<RoomAvailability>(`/rooms/${id}/availability?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`),
    getAvailable: (start: string, end: string, minCapacity?: number) => {
      let query = `start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
      if (minCapacity) query += `&minCapacity=${minCapacity}`;
      return request<RoomAvailability[]>(`/rooms/available?${query}`);
    },
    create: (data: Partial<Room>) =>
      request<Room>("/rooms", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Room>) =>
      request<Room>(`/rooms/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/rooms/${id}`, { method: "DELETE" }),
  },

  // Meetings
  meetings: {
    getAll: () => request<Meeting[]>("/meetings"),
    getById: (id: number) => request<Meeting>(`/meetings/${id}`),
    getByOrganizer: (organizerId: number) => request<Meeting[]>(`/meetings/organizer/${organizerId}`),
    getByStatus: (status: MeetingStatus) => request<Meeting[]>(`/meetings/status/${status}`),
    getCalendar: (start: string, end: string, roomId?: number) => {
      let query = `start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
      if (roomId) query += `&roomId=${roomId}`;
      return request<Meeting[]>(`/meetings/calendar?${query}`);
    },
    create: (data: MeetingCreateRequest) =>
      request<Meeting>("/meetings", { method: "POST", body: JSON.stringify(data) }),
    previewRecurring: (data: RecurringMeetingCreateRequest) =>
      request<RecurringPreviewResponse>("/meetings/recurring/preview", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createRecurring: (data: RecurringMeetingCreateRequest) =>
      request<Meeting[]>("/meetings/recurring", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<MeetingCreateRequest>) =>
      request<Meeting>(`/meetings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    approve: (id: number) =>
      request<Meeting>(`/meetings/${id}/approve`, { method: "PATCH" }),
    cancel: (id: number, reason?: string) => {
      const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
      return request<Meeting>(`/meetings/${id}/cancel${query}`, { method: "PATCH" });
    },
    checkIn: (id: number) =>
      request<Meeting>(`/meetings/${id}/check-in`, { method: "PATCH" }),
    endEarly: (id: number) =>
      request<Meeting>(`/meetings/${id}/end-early`, { method: "PATCH" }),
    updateRSVP: (id: number, userId: number, status: AttendeeResponseStatus) =>
      request<void>(`/meetings/${id}/attendee/${userId}/rsvp?status=${status}`, { method: "PATCH" }),

    // Meeting Minutes (MOM)
    getMinutes: (id: number) => request<MeetingMinutes | null>(`/meetings/${id}/minutes`),
    saveMinutes: (id: number, data: MeetingMinutesRequest) =>
      request<MeetingMinutes>(`/meetings/${id}/minutes`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    // Action Items within Meeting
    getActionItems: (id: number) => request<ActionItem[]>(`/meetings/${id}/actions`),
    createActionItem: (id: number, data: ActionItemCreateRequest) =>
      request<ActionItem>(`/meetings/${id}/actions`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    // Attachments within Meeting
    getAttachments: (id: number) => request<MeetingAttachment[]>(`/meetings/${id}/attachments`),
    addAttachment: (id: number, data: MeetingAttachmentCreateRequest) =>
      request<MeetingAttachment>(`/meetings/${id}/attachments`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Action Items Global Management
  actionItems: {
    getUserItems: (userId: number, status?: ActionItemStatus) =>
      request<ActionItem[]>(
        `/actions/user/${userId}${status ? `?status=${encodeURIComponent(status)}` : ""}`
      ),
    updateStatus: (itemId: number, status: ActionItemStatus) =>
      request<ActionItem>(`/actions/${itemId}/status?status=${encodeURIComponent(status)}`, {
        method: "PATCH",
      }),
    delete: (itemId: number) =>
      request<void>(`/actions/${itemId}`, { method: "DELETE" }),
  },

  // Meeting Attachments Global Operations
  attachments: {
    delete: (attachmentId: number) =>
      request<void>(`/attachments/${attachmentId}`, { method: "DELETE" }),
  },

  // Materials & Equipment
  materials: {
    getAll: () => request<Material[]>("/materials"),
    getById: (id: number) => request<Material>(`/materials/${id}`),
    getByType: (type: MaterialType) => request<Material[]>(`/materials/type/${type}`),
    create: (data: Partial<Material>) =>
      request<Material>("/materials", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Material>) =>
      request<Material>(`/materials/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/materials/${id}`, { method: "DELETE" }),
  },

  // Support Staff
  staff: {
    getAll: () => request<Staff[]>("/staff"),
    getById: (id: number) => request<Staff>(`/staff/${id}`),
    getByRole: (role: StaffRole) => request<Staff[]>(`/staff/role/${role}`),
    getAvailable: (start: string, end: string) =>
      request<Staff[]>(`/staff/available?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`),
    create: (data: Partial<Staff>) =>
      request<Staff>("/staff", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Staff>) =>
      request<Staff>(`/staff/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/staff/${id}`, { method: "DELETE" }),
  },

  // Users & Departments
  users: {
    getAll: () => request<User[]>("/users"),
    getById: (id: number) => request<User>(`/users/${id}`),
    create: (data: Partial<User>) =>
      request<User>("/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<User>) =>
      request<User>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    updateStatus: (id: number, status: UserStatus) =>
      request<User>(`/users/${id}/status?status=${status}`, { method: "PATCH" }),
    updateBookingAccess: (id: number, access: BookingAccessLevel) =>
      request<User>(`/users/${id}/booking-access?access=${access}`, { method: "PATCH" }),
    delete: (id: number) => request<void>(`/users/${id}`, { method: "DELETE" }),
  },
  departments: {
    getAll: () => request<Department[]>("/departments"),
    getById: (id: number) => request<Department>(`/departments/${id}`),
    create: (data: Partial<Department>) =>
      request<Department>("/departments", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Department>) =>
      request<Department>(`/departments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/departments/${id}`, { method: "DELETE" }),
  },

  // Notifications
  notifications: {
    getByUser: (userId: number) => request<NotificationItem[]>(`/notifications/user/${userId}`),
    updateStatus: (id: number, status: NotificationStatus) =>
      request<void>(`/notifications/${id}/status?status=${status}`, { method: "PATCH" }),
    markAsRead: (id: number) =>
      request<void>(`/notifications/${id}/status?status=READ`, { method: "PATCH" }),
    markAllAsRead: (userId: number) =>
      request<void>(`/notifications/user/${userId}/read-all`, { method: "PATCH" }),
  },

  // Dynamic System Settings & Governance
  systemSettings: {
    getPublic: () => request<SystemSettingItem[]>("/system/settings"),
    getAll: () => request<SystemSettingItem[]>("/system/settings/all"),
    getByCategory: (category: SettingCategory) =>
      request<SystemSettingItem[]>(`/system/settings/category/${category}`),
    batchUpdate: (updates: SystemSettingUpdateItem[]) =>
      request<SystemSettingItem[]>("/system/settings", {
        method: "PUT",
        body: JSON.stringify(updates),
      }),
    updateSingle: (key: string, value: string) =>
      request<SystemSettingItem>(
        `/system/settings/${encodeURIComponent(key)}?value=${encodeURIComponent(value)}`,
        { method: "PATCH" }
      ),
    resetToDefaults: () =>
      request<void>("/system/settings/reset", { method: "POST" }),
  },

  // System Version & Metadata
  system: {
    getInfo: () => request<SystemInfo>("/system/info"),
  },

  // Audit Logs & Security
  auditLogs: {
    getAll: (params?: {
      actionType?: string;
      entityType?: string;
      keyword?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      size?: number;
    }) => {
      const query = new URLSearchParams();
      if (params?.actionType) query.append("actionType", params.actionType);
      if (params?.entityType) query.append("entityType", params.entityType);
      if (params?.keyword) query.append("keyword", params.keyword);
      if (params?.startDate) query.append("startDate", params.startDate);
      if (params?.endDate) query.append("endDate", params.endDate);
      if (params?.page !== undefined) query.append("page", String(params.page));
      if (params?.size !== undefined) query.append("size", String(params.size));
      const queryString = query.toString() ? `?${query.toString()}` : "";
      return request<{
        content: AuditLog[];
        totalElements: number;
        totalPages: number;
        number: number;
      }>(`/audit-logs${queryString}`);
    },
    getSummary: () => request<AuditLogSummary>("/audit-logs/summary"),
    getById: (id: number) => request<AuditLog>(`/audit-logs/${id}`),
    exportCsvUrl: (params?: {
      actionType?: string;
      entityType?: string;
      keyword?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.actionType) query.append("actionType", params.actionType);
      if (params?.entityType) query.append("entityType", params.entityType);
      if (params?.keyword) query.append("keyword", params.keyword);
      if (params?.startDate) query.append("startDate", params.startDate);
      if (params?.endDate) query.append("endDate", params.endDate);
      const queryString = query.toString() ? `?${query.toString()}` : "";
      return `${API_BASE}/audit-logs/export${queryString}`;
    },
  },

  // Telegram Multi-Channel Alerts & Templates
  telegram: {
    getStatus: () => request<TelegramStatus>("/telegram/status"),
    getConfig: () => request<TelegramBotConfig>("/telegram/config"),
    updateConfig: (data: TelegramBotConfigUpdate) =>
      request<TelegramBotConfig>("/telegram/config", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    validateToken: (token?: string) =>
      request<TelegramValidationResult>("/telegram/validate-token", {
        method: "POST",
        body: JSON.stringify({ token: token || "" }),
      }),
    sendTest: (chatId?: string, customMessage?: string) =>
      request<{ success: boolean; targetChatId: string; message: string }>("/telegram/test", {
        method: "POST",
        body: JSON.stringify({ chatId, customMessage }),
      }),
    getTemplates: () => request<NotificationTemplate[]>("/telegram/templates"),
    updateTemplate: (type: NotificationType, content: string) =>
      request<NotificationTemplate>(`/telegram/templates/${type}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
      }),
    resetTemplate: (type: NotificationType) =>
      request<NotificationTemplate>(`/telegram/templates/${type}/reset`, {
        method: "POST",
      }),
    previewTemplate: (type: NotificationType, content?: string) =>
      request<{ rendered: string }>("/telegram/templates/preview", {
        method: "POST",
        body: JSON.stringify({ type, content }),
      }),
    updateUserSettings: (userId: number, payload: TelegramSettingsPayload) =>
      request<User>(`/telegram/users/${userId}/settings`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
  },

  // Facility & Room Issues
  issues: {
    getForRoom: (roomId: number) => request<RoomIssue[]>(`/rooms/${roomId}/issues`),
    report: (roomId: number, data: RoomIssueCreateRequest, userId?: number) =>
      request<RoomIssue>(`/rooms/${roomId}/issues${userId ? `?userId=${userId}` : ""}`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getAll: () => request<RoomIssue[]>("/issues"),
    updateStatus: (issueId: number, data: RoomIssueUpdateRequest) =>
      request<RoomIssue>(`/issues/${issueId}/status`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // Space Intelligence & Utilization Analytics
  analytics: {
    getSummary: (start?: string, end?: string) => {
      let query = "";
      if (start && end) {
        query = `?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
      }
      return request<AnalyticsSummary>(`/analytics${query}`);
    },
  },
};

