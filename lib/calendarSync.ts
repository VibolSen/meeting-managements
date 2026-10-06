import { Meeting } from "./api";

/**
 * Format ISO datetime string into UTC iCalendar format: YYYYMMDDTHHMMSSZ
 */
export function formatIcsDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Generates an RFC 5545 compliant .ics string for a meeting
 */
export function generateIcsContent(
  meeting: Meeting,
  locationName?: string
): string {
  const dtStart = formatIcsDate(meeting.startTime);
  const dtEnd = formatIcsDate(meeting.endTime);
  const dtStamp = formatIcsDate(new Date().toISOString());
  const uid = `mms-meeting-${meeting.meetingId}-${Date.now()}@meetinghub.internal`;

  const location =
    locationName ||
    meeting.room?.name ||
    "Conference Room";

  const description = (meeting.purpose || "Meeting session scheduled via Meeting Management Hub")
    .replace(/\r\n/g, "\\n")
    .replace(/\n/g, "\\n");

  const organizerName = meeting.organizer?.name || "Meeting Organizer";
  const organizerEmail = meeting.organizer?.email || "no-reply@meetinghub.internal";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Meeting Management Hub//Enterprise Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${meeting.title.replace(/[\r\n]/g, " ")}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location.replace(/[\r\n]/g, " ")}`,
    `ORGANIZER;CN=${organizerName}:mailto:${organizerEmail}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${meeting.title}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Triggers a browser download of the .ics file
 */
export function downloadIcsFile(meeting: Meeting, locationName?: string): void {
  const ics = generateIcsContent(meeting, locationName);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const cleanTitle = (meeting.title || "meeting")
    .replace(/[^a-zA-Z0-9_\-]/g, "_")
    .slice(0, 40);

  link.href = url;
  link.setAttribute("download", `${cleanTitle}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates direct Google Calendar add event URL
 */
export function getGoogleCalendarUrl(
  meeting: Meeting,
  locationName?: string
): string {
  const start = formatIcsDate(meeting.startTime);
  const end = formatIcsDate(meeting.endTime);
  const location = locationName || meeting.room?.name || "Meeting Room";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: meeting.title,
    dates: `${start}/${end}`,
    details: meeting.purpose || "Scheduled via Meeting Management Hub",
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates direct Outlook / Office 365 add event URL
 */
export function getOutlookCalendarUrl(
  meeting: Meeting,
  locationName?: string
): string {
  const startIso = new Date(meeting.startTime).toISOString();
  const endIso = new Date(meeting.endTime).toISOString();
  const location = locationName || meeting.room?.name || "Meeting Room";

  const params = new URLSearchParams({
    subject: meeting.title,
    startdt: startIso,
    enddt: endIso,
    body: meeting.purpose || "Scheduled via Meeting Management Hub",
    location: location,
    path: "/calendar/action/compose",
    rru: "addevent",
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}
