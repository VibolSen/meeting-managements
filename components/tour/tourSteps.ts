import { UserRole } from "@/lib/api";

export interface TourStep {
  id: string;
  selector: string;
  title: string;
  description: string;
  roleBadge: string;
  placement?: "bottom" | "top" | "left" | "right" | "center";
  category?: "header" | "navigation" | "feature" | "governance";
}

export const ADMIN_TOUR_STEPS: TourStep[] = [
  {
    id: "admin-workspace",
    selector: '[data-tour="workspace-role"]',
    title: "Admin Command Console",
    description: "Welcome to the enterprise control hub. Here you oversee cross-departmental room bookings, facility resources, logistics personnel, and security policies.",
    roleBadge: "ADMINISTRATION",
    placement: "bottom",
  },
  {
    id: "admin-telemetry-clock",
    selector: '[data-tour="telemetry-clock"]',
    title: "Facility Telemetry & Clock",
    description: "Real-time digital clock synchronized with company scheduling servers to ensure zero time-drift across room reservations and approval windows.",
    roleBadge: "SYSTEM TELEMETRY",
    placement: "bottom",
  },
  {
    id: "admin-theme-toggle",
    selector: '[data-tour="theme-toggle"]',
    title: "Theme Mode Switcher",
    description: "Toggle seamlessly between Clean Corporate Light and High-Contrast Cyber Dark modes with zero screen flicker.",
    roleBadge: "INTERFACE",
    placement: "bottom",
  },
  {
    id: "admin-notifications",
    selector: '[data-tour="notifications-bell"]',
    title: "Live Notification Center",
    description: "Instant dispatch center for pending boardroom requests, room maintenance tickets, and real-time schedule conflict warnings.",
    roleBadge: "ALERTS",
    placement: "bottom",
  },
  {
    id: "admin-help-tour",
    selector: '[data-tour="help-tour"]',
    title: "Help & Knowledge Hub",
    description: "Access searchable user manuals, operational guidelines, and restart this guided tour anytime by clicking this button.",
    roleBadge: "USER SUPPORT",
    placement: "bottom",
  },
  {
    id: "admin-sidebar",
    selector: '[data-tour="sidebar-nav"]',
    title: "Governance Navigation",
    description: "Navigate between Room Management, Equipment & Catering Inventory, Support Staff Roster, User Credentials, and Settings.",
    roleBadge: "NAVIGATION",
    placement: "right",
  },
  {
    id: "admin-kpis",
    selector: '[data-tour="kpi-metrics"]',
    title: "Facility Intelligence KPIs",
    description: "High-level summary cards tracking total meetings, pending approvals, active room utilization, and inventory health at a glance.",
    roleBadge: "METRICS",
    placement: "bottom",
  },
  {
    id: "admin-settings",
    selector: '[data-tour="nav-settings"]',
    title: "System Settings & Telegram Gateway",
    description: "Configure dynamic boardroom capacity thresholds, facility operating hours, and verify live Telegram Bot credentials directly from the UI.",
    roleBadge: "GOVERNANCE",
    placement: "right",
  },
];

export const ORGANIZER_TOUR_STEPS: TourStep[] = [
  {
    id: "org-workspace",
    selector: '[data-tour="workspace-role"]',
    title: "Organizer Command Center",
    description: "Your specialized portal for planning conferences, coordinating logistics equipment, allocating support technicians, and tracking participant RSVPs.",
    roleBadge: "ORGANIZER",
    placement: "bottom",
  },
  {
    id: "org-telemetry-clock",
    selector: '[data-tour="telemetry-clock"]',
    title: "Real-Time Scheduling Clock",
    description: "Live second-by-second facility clock to help you schedule tight turnaround intervals and anticipate meeting start times.",
    roleBadge: "TIMEKEEPING",
    placement: "bottom",
  },
  {
    id: "org-notifications",
    selector: '[data-tour="notifications-bell"]',
    title: "RSVP & Status Alerts",
    description: "Receive instant notifications when attendees accept or decline invitations, and when large room bookings receive Admin approval.",
    roleBadge: "ALERTS",
    placement: "bottom",
  },
  {
    id: "org-booking-nav",
    selector: '[data-tour="nav-booking"]',
    title: "Smart Booking Wizard",
    description: "Launch the multi-step reservation engine featuring microsecond conflict detection, material stock allocation, and available staff assignment.",
    roleBadge: "RESERVATIONS",
    placement: "right",
  },
  {
    id: "org-calendar-nav",
    selector: '[data-tour="nav-calendar"]',
    title: "Room Schedule & Timeline Grid",
    description: "Explore the visual timetable across all corporate conference halls. Click any vacant slot to pre-fill the booking wizard instantly.",
    roleBadge: "SCHEDULE",
    placement: "right",
  },
  {
    id: "org-meetings-nav",
    selector: '[data-tour="nav-meetings"]',
    title: "Meetings & Minutes Hub",
    description: "Manage your booked meetings, review attendee responses, record collaborative meeting minutes, and delegate trackable action items.",
    roleBadge: "COLLABORATION",
    placement: "right",
  },
];

export const EMPLOYEE_TOUR_STEPS: TourStep[] = [
  {
    id: "emp-workspace",
    selector: '[data-tour="workspace-role"]',
    title: "Employee Access Portal",
    description: "Your personalized hub to check your daily meeting agenda, respond to conference invitations, and reserve standard meeting rooms.",
    roleBadge: "STAFF PORTAL",
    placement: "bottom",
  },
  {
    id: "emp-notifications",
    selector: '[data-tour="notifications-bell"]',
    title: "Invitation & Meeting Alerts",
    description: "Stay informed with immediate alerts whenever a colleague invites you to a meeting or reschedules an existing conference.",
    roleBadge: "INBOX",
    placement: "bottom",
  },
  {
    id: "emp-theme-toggle",
    selector: '[data-tour="theme-toggle"]',
    title: "Comfort Theme Switcher",
    description: "Switch to dark mode anytime for comfortable viewing during low-light sessions or prolonged scheduling tasks.",
    roleBadge: "DISPLAY",
    placement: "bottom",
  },
  {
    id: "emp-agenda",
    selector: '[data-tour="agenda-feed"]',
    title: "Today's Agenda & RSVP Hub",
    description: "Review upcoming conference sessions, room locations, organizers, and quickly confirm or decline your attendance with one click.",
    roleBadge: "AGENDA",
    placement: "bottom",
  },
  {
    id: "emp-room-browser",
    selector: '[data-tour="room-browser"]',
    title: "Facility Room Availability",
    description: "Check open time blocks in corporate conference rooms and huddle spaces before planning team discussions.",
    roleBadge: "SPACES",
    placement: "bottom",
  },
];

export function getStepsForRole(role: UserRole): TourStep[] {
  switch (role) {
    case "ADMIN":
      return ADMIN_TOUR_STEPS;
    case "ORGANIZER":
      return ORGANIZER_TOUR_STEPS;
    case "EMPLOYEE":
    default:
      return EMPLOYEE_TOUR_STEPS;
  }
}
