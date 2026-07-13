import type { AvatarPresence, AvatarTone } from "@/components/primitives/avatar";

export type MatchLifecycleStatus =
  | "scheduled"
  | "check-in-unavailable"
  | "check-in-open"
  | "checked-in"
  | "opponent-not-checked-in"
  | "both-ready"
  | "lobby-open"
  | "in-progress"
  | "result-pending"
  | "disputed"
  | "forfeited"
  | "cancelled"
  | "completed";

export type CheckInState = "unavailable" | "available" | "checking-in" | "checked-in" | "missed";

export type MatchResultState = "pending" | "won" | "lost" | "draw" | "disputed" | "void";

export type TimelineStepState = "complete" | "current" | "future" | "error";

export type MatchParticipantViewModel = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarSrc: string | null;
  presence: AvatarPresence;
  tone: AvatarTone;
  verified: boolean;
  score: number | null;
};

export type MatchViewModel = {
  id: string;
  competitionName: string;
  roundLabel: string;
  status: MatchLifecycleStatus;
  timerLabel: string;
  home: MatchParticipantViewModel;
  away: MatchParticipantViewModel;
};
