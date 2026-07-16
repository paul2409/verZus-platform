import { competitionLifecyclePolicyInputSchema } from "./competition-lifecycle.schema";
import type {
  CompetitionLifecycleDecision,
  CompetitionLifecyclePolicyInput,
} from "./competition-lifecycle.types";

const closedLifecycleStates = new Set([
  "draft",
  "scheduled",
  "registration_closed",
  "check_in_open",
  "in_progress",
  "completed",
  "archived",
]);

export function resolveCompetitionLifecycle(
  input: CompetitionLifecyclePolicyInput,
): CompetitionLifecycleDecision {
  const value = competitionLifecyclePolicyInputSchema.parse(input);
  const base = {
    competitionId: value.competitionId,
    lifecycle: value.lifecycle,
    registeredCount: value.registeredCount,
    capacity: value.capacity,
  } as const;

  if (!value.exists) {
    return {
      ...base,
      disposition: "not_found",
      title: "COMPETITION NOT FOUND",
      message: "This competition no longer exists or the link is no longer valid.",
      severity: "critical",
      primaryAction: "back_to_discovery",
      entryAllowed: false,
      waitlistAllowed: false,
      blocking: true,
      retryable: false,
    };
  }

  if (value.authorization === "unauthorized") {
    return {
      ...base,
      disposition: "unauthorized",
      title: "SIGN IN REQUIRED",
      message: "Sign in before viewing or entering this competition.",
      severity: "warning",
      primaryAction: "sign_in",
      entryAllowed: false,
      waitlistAllowed: false,
      blocking: true,
      retryable: false,
    };
  }

  if (value.authorization === "forbidden") {
    return {
      ...base,
      disposition: "forbidden",
      title: "ACCESS RESTRICTED",
      message: "Your account does not have permission to access this competition.",
      severity: "critical",
      primaryAction: "back_to_discovery",
      entryAllowed: false,
      waitlistAllowed: false,
      blocking: true,
      retryable: false,
    };
  }

  if (value.system === "maintenance") {
    return {
      ...base,
      disposition: "maintenance",
      title: "COMPETITIONS UNDER MAINTENANCE",
      message: "Entry controls are temporarily paused while competition services are maintained.",
      severity: "warning",
      primaryAction: "retry",
      entryAllowed: false,
      waitlistAllowed: false,
      blocking: true,
      retryable: true,
    };
  }

  if (value.system === "offline") {
    return {
      ...base,
      disposition: "offline",
      title: "YOU ARE OFFLINE",
      message: "Competition details already loaded remain visible. Reconnect before entering.",
      severity: "warning",
      primaryAction: "retry",
      entryAllowed: false,
      waitlistAllowed: false,
      blocking: false,
      retryable: true,
    };
  }

  if (value.lifecycle === "cancelled") {
    return {
      ...base,
      disposition: "cancelled",
      title: "COMPETITION CANCELLED",
      message:
        "This competition has been cancelled. Existing entries remain available for support and refund status.",
      severity: "critical",
      primaryAction: "back_to_discovery",
      entryAllowed: false,
      waitlistAllowed: false,
      blocking: true,
      retryable: false,
    };
  }

  if (value.eligibility === "not_eligible") {
    return {
      ...base,
      disposition: "not_eligible",
      title: "NOT ELIGIBLE",
      message:
        "Your current profile, rank, region, trust score, or roster does not satisfy this competition's requirements.",
      severity: "warning",
      primaryAction: "review_eligibility",
      entryAllowed: false,
      waitlistAllowed: false,
      blocking: false,
      retryable: false,
    };
  }

  if (closedLifecycleStates.has(value.lifecycle)) {
    const beforeOpen = value.lifecycle === "draft" || value.lifecycle === "scheduled";
    return {
      ...base,
      disposition: "registration_closed",
      title: beforeOpen ? "REGISTRATION NOT OPEN" : "REGISTRATION CLOSED",
      message: beforeOpen
        ? "Registration has not opened yet. Review the schedule for the opening time."
        : "The registration deadline has passed. Existing entries can still be managed where allowed.",
      severity: "warning",
      primaryAction: "view_schedule",
      entryAllowed: false,
      waitlistAllowed: false,
      blocking: false,
      retryable: false,
    };
  }

  const isFull = value.registeredCount >= value.capacity;
  if (isFull && value.waitlistEnabled) {
    return {
      ...base,
      disposition: "waitlist_available",
      title: "COMPETITION FULL — WAITLIST OPEN",
      message: "All active slots are filled. Review the waitlist terms before joining the queue.",
      severity: "info",
      primaryAction: "view_waitlist",
      entryAllowed: false,
      waitlistAllowed: true,
      blocking: false,
      retryable: false,
    };
  }

  if (isFull) {
    return {
      ...base,
      disposition: "full_capacity",
      title: "COMPETITION AT CAPACITY",
      message: "No entry or waitlist slots are available. Existing entries are unaffected.",
      severity: "warning",
      primaryAction: "back_to_discovery",
      entryAllowed: false,
      waitlistAllowed: false,
      blocking: false,
      retryable: false,
    };
  }

  if (value.partialFailure) {
    return {
      ...base,
      disposition: "partial_failure",
      title: "ONE SECTION IS UNAVAILABLE",
      message:
        "Core competition details and navigation remain available. Retry the failed section before entering if required.",
      severity: "warning",
      primaryAction: "retry",
      entryAllowed: true,
      waitlistAllowed: false,
      blocking: false,
      retryable: true,
    };
  }

  return {
    ...base,
    disposition: "entry_open",
    title: "REGISTRATION OPEN",
    message: "This competition is accepting eligible entries.",
    severity: "info",
    primaryAction: "none",
    entryAllowed: true,
    waitlistAllowed: false,
    blocking: false,
    retryable: false,
  };
}
