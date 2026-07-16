export const competitionLifecycleStates = [
  "draft",
  "scheduled",
  "registration_open",
  "registration_closed",
  "check_in_open",
  "in_progress",
  "completed",
  "cancelled",
  "archived",
] as const;

export type CompetitionLifecycleState = (typeof competitionLifecycleStates)[number];

export const competitionLifecycleScenarios = [
  "normal",
  "registration_closed",
  "waitlist",
  "not_eligible",
  "full_capacity",
  "cancelled",
  "offline",
  "partial_failure",
  "unauthorized",
  "forbidden",
  "not_found",
  "maintenance",
] as const;

export type CompetitionLifecycleScenario = (typeof competitionLifecycleScenarios)[number];

export type CompetitionLifecycleDisposition =
  | "entry_open"
  | "registration_closed"
  | "waitlist_available"
  | "not_eligible"
  | "full_capacity"
  | "cancelled"
  | "offline"
  | "partial_failure"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "maintenance";

export type CompetitionLifecycleSeverity = "info" | "warning" | "critical";

export type CompetitionLifecycleAction =
  | "none"
  | "view_schedule"
  | "review_eligibility"
  | "view_waitlist"
  | "retry"
  | "sign_in"
  | "back_to_discovery";

export type CompetitionEligibilityState = "eligible" | "not_eligible";
export type CompetitionAuthorizationState = "authorized" | "unauthorized" | "forbidden";
export type CompetitionSystemState = "available" | "offline" | "maintenance";

export type CompetitionLifecyclePolicyInput = {
  competitionId: string;
  exists: boolean;
  lifecycle: CompetitionLifecycleState;
  eligibility: CompetitionEligibilityState;
  authorization: CompetitionAuthorizationState;
  system: CompetitionSystemState;
  registeredCount: number;
  capacity: number;
  waitlistEnabled: boolean;
  partialFailure: boolean;
};

export type CompetitionLifecycleDecision = {
  competitionId: string;
  lifecycle: CompetitionLifecycleState;
  disposition: CompetitionLifecycleDisposition;
  title: string;
  message: string;
  severity: CompetitionLifecycleSeverity;
  primaryAction: CompetitionLifecycleAction;
  entryAllowed: boolean;
  waitlistAllowed: boolean;
  blocking: boolean;
  retryable: boolean;
  registeredCount: number;
  capacity: number;
};

export type CompetitionLifecycleMeta = {
  requestId: string;
  serverNow: string;
  lastUpdatedAt: string;
  freshness: "fresh" | "stale";
};

export type CompetitionLifecycleResource = CompetitionLifecycleDecision & {
  scenario: CompetitionLifecycleScenario;
  meta: CompetitionLifecycleMeta;
};

export type CompetitionLifecycleApiError = {
  code: string;
  message: string;
  requestId: string | null;
  retryable: boolean;
  fieldErrors?: Record<string, string[]> | undefined;
};
