// VERZUS M4 STEP 4.10

import type { AppFailureCode } from "../../shared/failures";

export interface OnboardingFailureScenario {
  id: string;
  code: AppFailureCode;
  resource: "progress" | "games" | "locations" | "identity" | "availability" | "crews";
  expectedState: "offline" | "maintenance" | "partial_failure" | "unauthorized" | "forbidden";
  preservesDraft: boolean;
}

export const onboardingFailureScenarios = [
  {
    id: "offline-progress",
    code: "offline",
    resource: "progress",
    expectedState: "offline",
    preservesDraft: true,
  },
  {
    id: "maintenance-options",
    code: "maintenance",
    resource: "games",
    expectedState: "maintenance",
    preservesDraft: true,
  },
  {
    id: "partial-crew-discovery",
    code: "partial_failure",
    resource: "crews",
    expectedState: "partial_failure",
    preservesDraft: true,
  },
  {
    id: "expired-session",
    code: "session_refresh_failed",
    resource: "progress",
    expectedState: "unauthorized",
    preservesDraft: true,
  },
  {
    id: "restricted-account",
    code: "forbidden",
    resource: "progress",
    expectedState: "forbidden",
    preservesDraft: true,
  },
] as const satisfies readonly OnboardingFailureScenario[];
