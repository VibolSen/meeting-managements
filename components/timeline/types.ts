import { Meeting, Room } from "@/lib/api";

export const TIMELINE_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const;

export type TimelineViewMode = "timeline" | "agenda";

export interface TimelineHeaderProps {
  selectedDate: string;
  formattedDateTitle: string;
  rooms: Room[];
  filterRoomId: string;
  viewMode: TimelineViewMode;
  loading: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onDateChange: (date: string) => void;
  onFilterRoomChange: (roomId: string) => void;
  onViewModeChange: (mode: TimelineViewMode) => void;
  onRefresh: () => void;
}

export interface TimelineLegendProps {
  showHint?: boolean;
}

export interface TimelineGridProps {
  rooms: Room[];
  meetings: Meeting[];
  selectedDate: string;
  onBookSlot: (roomId: number, date: string, startTime: string, endTime: string) => void;
  onViewMeeting: (meeting: Meeting) => void;
}

export interface TimelineAgendaViewProps {
  meetings: Meeting[];
  rooms: Room[];
  selectedDate: string;
  onBookSlot: (roomId: number, date: string, startTime: string, endTime: string) => void;
  onViewMeeting: (meeting: Meeting) => void;
}
