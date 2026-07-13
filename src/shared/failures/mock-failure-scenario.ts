// VERZUS M4 STEP 4.10

export const mockFailureScenarioValues = [
  "invalid_credentials",
  "duplicate_account",
  "expired_verification_code",
  "expired_reset_token",
  "rate_limited",
  "offline",
  "maintenance",
  "session_refresh_failed",
  "suspended",
  "banned",
  "partial_failure",
] as const;

export type MockFailureScenario = (typeof mockFailureScenarioValues)[number];

export interface ResolveMockFailureScenarioInput {
  nodeEnv: string | undefined;
  queryScenario: string | null;
  headerScenario: string | null;
}

export function resolveMockFailureScenario(
  input: ResolveMockFailureScenarioInput,
): MockFailureScenario | null {
  if (input.nodeEnv === "production") {
    return null;
  }

  const requested = input.queryScenario ?? input.headerScenario;

  if (requested && mockFailureScenarioValues.includes(requested as MockFailureScenario)) {
    return requested as MockFailureScenario;
  }

  return null;
}
