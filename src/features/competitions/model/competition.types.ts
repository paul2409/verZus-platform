export type CompetitionLifecycleStatus =
  | "draft"
  | "scheduled"
  | "registration-open"
  | "registration-closed"
  | "check-in-open"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "archived";

export type EligibilityState = "eligible" | "ineligible" | "pending" | "closed";

export type CompetitionViewModel = {
  id: string;
  name: string;
  game: string;
  format: string;
  status: CompetitionLifecycleStatus;
  eligibility: EligibilityState;
  eligibilityMessage: string;
  startsAtLabel: string;
  timezoneLabel: string;
  rewardLabel: string;
  participantCount: number;
  capacity: number;
};
