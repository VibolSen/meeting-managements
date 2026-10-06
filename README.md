# Meeting Management System (MMS) - Enterprise Frontend Application (v1.5.0)

A modern, high-performance enterprise web application engineered with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. Built as a comprehensive corporate facility logistics platform featuring role-tailored workspaces for Administrators, Organizers, and Employees, alongside standalone digital signage kiosks for conference room tablets.

---

## 🌟 Key Application Highlights

- **Tailored Role Workspaces**: Role-governed dashboards and navigation specifically customized for **Admins**, **Organizers**, and **Employees**.
- **Interactive Technology Launchpad**: Futuristic landing gateway with a real-time cursor-tracking spotlight, cyber geometric grid, ambient aurora energy orbs, and live telemetry badges.
- **Dynamic 6-Step Booking Wizard**: Interactive meeting reservation modal with instant conflict diagnosis, equipment allocation, support staff assignment, recurring cadence preview, and attendee invitations.
- **External Calendar Sync**: Native **iCalendar (`.ics`)** downloads and direct **Google Calendar** integration links for any scheduled meeting.
- **Meeting Minutes (MOM) & Action Items**: Formal meeting minutes capture and personal action items checklists with interactive completion toggles.
- **Digital Signage Room Kiosks (`/room-display/[id]`)**: Full-screen high-visibility tablet displays for room doorways featuring live occupancy states, countdown timers, and on-kiosk incident reporting.
- **Adaptive Theme System**: Clean, premium **Light Mode by default** with a fluid **Dark Mode** toggle.

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | 16.3.6 (App Router) | React framework with server and client components |
| **React** | 19.2.8 | UI component runtime |
| **TypeScript** | 5.x | End-to-end static typing and schema validation |
| **Tailwind CSS** | v4.0 | Modern utility-first CSS styling with `@custom-variant dark` |
| **Lucide React** | Latest | Consistent enterprise iconography |
| **Framer Motion** | 13.x | Fluid micro-interactions and modal transitions |
| **SheetJS (xlsx)** | 0.18.5 | Excel (`.xlsx`) and CSV import/export capabilities |

---

## 🖥️ Workspaces & Module Architecture

### 1. Futuristic Launchpad (`/`)
- Interactive mouse-tracking radial spotlight glow.
- Cybernetic 44px geometric grid, 22px dot matrix, and ambient aurora blurs.
- System telemetry markers (`API_LATENCY < 10ms`, `SHA-256`, `SYS.GATEWAY`).
- Floating glassmorphism badges (`Conflict Engine: Zero Overlap`, `Room Kiosks: Live Sync`).
- Live system operational heartbeat badge (`Enterprise v1.5.0`).

### 2. Corporate Access Gateway (`/login`)
- Dedicated **Sign In** interface; public registration is disabled for internal corporate governance.
- Authenticates against Spring Boot backend (`POST /api/auth/login`) with JWT token storage.
- Quick role sign-in presets (`Admin`, `Organizer`, `Employee`) for rapid verification.

### 3. Administrator Workspace (`/admin`)
- **Executive Dashboard** (`/admin/dashboard`): Real-time facility occupancy, today's schedule, quick actions, and deep utilization analytics with peak booking heatmaps.
- **Master Timeline** (`/admin/master-timeline`): Interactive Gantt visualizer displaying concurrent bookings across all rooms by time slot.
- **Meetings & Approvals** (`/admin/meetings-approvals`): Boardroom approval queue ($\ge 20$ capacity), cancellation management, and meeting inspector.
- **Room Management** (`/admin/room-management`): Room creation, capacity configuration, amenity tagging, and operational status controls (`ACTIVE`, `MAINTENANCE`).
- **Equipment Inventory** (`/admin/equipment-inventory`): Catalog of audio/visual hardware, stationery, and refreshments with live stock levels.
- **Staff Roster** (`/admin/staff-roster`): Certified personnel management (technicians, receptionists, facilitators) with real-time schedule conflict verification.
- **Department Directory** (`/admin/department-management`): Department hierarchy and user distribution.
- **User Directory** (`/admin/user-management`): Staff provisioning, role assignment (`ADMIN`, `ORGANIZER`, `EMPLOYEE`), booking permission levels (`FULL_ACCESS`, `VIEW_ONLY`), and Excel/CSV bulk import/export.
- **Audit Logs** (`/admin/audit-logs`): Filterable timeline of administrative system changes.
- **Settings & Governance** (`/admin/settings`): Runtime booking constraints (max booking hours, lead times, grace periods) and dynamic Telegram notification template editor.

### 4. Meeting Organizer Workspace (`/organizer`)
- **Dashboard** (`/organizer/dashboard`): Overview of organized meetings, pending confirmations, and fast booking actions.
- **Booking Wizard Modal**: 6-step guided wizard validating room conflicts, allocating equipment, scheduling staff, and configuring recurring schedules (`DAILY`, `WEEKLY`, `BI_WEEKLY`, `MONTHLY`).
- **My Meetings** (`/organizer/meetings`): Comprehensive meeting lifecycle management, check-in, early end release, meeting minutes (MOM) editor, and action item assignments.
- **Invitations Roster** (`/organizer/invitations`): Attendee RSVP tracking (`ACCEPTED`, `DECLINED`, `PENDING`).
- **Calendar & Timeline** (`/organizer/calendar`): Personal booking calendar with one-click `.ics` export.

### 5. Employee Workspace (`/employee`)
- **Employee Hub** (`/employee/dashboard`): Today's personal meeting schedule, pending invitation alerts, and personal action items checklist with live completion toggles.
- **Meeting RSVPs** (`/employee/invitations`): Fast RSVP response actions (`Accept` or `Decline`).
- **Meeting History** (`/employee/history`): Personal archive of past attended sessions.

### 6. Digital Signage Kiosk (`/room-display/[id]`)
- Designed for wall-mounted Android/iPad tablets outside physical conference rooms.
- Real-time room status indicators:
  - 🟢 **AVAILABLE**: Room is free to use or instant-book.
  - 🔴 **OCCUPIED**: Live meeting in progress with host details and time remaining.
  - 🟡 **STARTING SOON**: Pre-meeting preparation period.
- Quick QR-code check-in trigger and on-kiosk equipment issue reporting (`Audio/Visual`, `Cleanliness`, `HVAC`).

---

## 📁 Project Directory Structure

```
meeting-managements/
├── app/
│   ├── page.tsx                    # Launchpad (Futuristic Gateway)
│   ├── login/                      # Corporate Staff Sign In
│   ├── signup/                     # Redirects to /login (Internal Only)
│   ├── admin/                      # Administrator Workspace
│   │   ├── dashboard/              # Analytics & Facility KPIs
│   │   ├── master-timeline/        # Full Facility Visual Timeline
│   │   ├── meetings-approvals/     # Boardroom Approvals
│   │   ├── room-management/        # Conference Rooms & Kiosks
│   │   ├── equipment-inventory/    # Materials & Stock Logistics
│   │   ├── staff-roster/           # Personnel Scheduling
│   │   ├── department-management/  # Department Hierarchy
│   │   ├── user-management/        # Staff Directory & CSV Import
│   │   ├── audit-logs/             # Immutable Audit Trail
│   │   ├── settings/               # System Governance & Templates
│   │   └── profile/                # Personal Profile
│   ├── organizer/                  # Meeting Organizer Workspace
│   │   ├── dashboard/              # Organizer KPIs & Quick Book
│   │   ├── meetings/               # Managed Meetings & Minutes
│   │   ├── invitations/            # Attendee RSVP Tracking
│   │   └── calendar/               # Organizer Calendar
│   ├── employee/                   # Employee Workspace
│   │   ├── dashboard/              # Personal Schedule & Action Items
│   │   ├── invitations/            # Meeting RSVP Inbox
│   │   └── history/                # Past Meetings
│   ├── room-display/[id]/          # Signage Kiosk Tablet View
│   ├── globals.css                 # Tailwind v4 Tokens & Theme Adapters
│   └── layout.tsx                  # Root HTML & Toast Provider
├── components/
│   ├── BookingWizard.tsx           # 6-Step Meeting Scheduling Wizard
│   ├── LaunchPage.tsx              # Futuristic Tech Canvas
│   ├── Toast.tsx                   # Enterprise Notification Toasts
│   ├── ThemeToggle.tsx             # Light / Dark Mode Toggle
│   ├── auth/                       # Sign In Component
│   ├── dashboard/                  # Heatmaps & Analytics Visualizers
│   ├── meetings/                   # Minutes, Actions, & Calendar Sync
│   ├── resources/                  # Room, Material, & Staff Modals
│   ├── sidebars/                   # Dynamic Sidebars with Live v1.5.0 Badge
│   └── ui/                         # Reusable Component Primitives
├── lib/
│   ├── api.ts                      # Centralized REST Client with JWT
│   ├── auth.tsx                    # Auth Context & Session Management
│   └── calendarSync.ts             # iCalendar (.ics) & Google Calendar Sync
└── package.json                    # Dependencies & v1.5.0
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** 18.18+ or 20+
- **Spring Boot Backend** running on `http://localhost:8080`

### 1. Installation
Clone the repository and install dependencies:

```bash
cd meeting-managements
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 3. Development Server
Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
Validate types and compile the optimized production bundle:

```bash
npm run build
npm run start
```
