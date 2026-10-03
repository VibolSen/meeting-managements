import { DashboardSummary, Meeting, User } from "@/lib/api";

export interface DashboardHeaderProps {
  currentUser: User | null;
  loading: boolean;
  onRefresh: () => void;
  onScheduleMeeting: () => void;
}

export interface DashboardKpiGridProps {
  summary: DashboardSummary | null;
  loading: boolean;
  onNavigate: (href: string) => void;
}

export interface UpcomingMeetingsListProps {
  meetings: Meeting[];
  loading: boolean;
  onViewMeeting: (meeting: Meeting) => void;
  onViewAllMeetings: () => void;
  onScheduleMeeting: () => void;
}

export interface DashboardActionCenterProps {
  summary: DashboardSummary | null;
  loading: boolean;
  onReviewApprovals: () => void;
}
