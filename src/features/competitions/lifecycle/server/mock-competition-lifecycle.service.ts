import { randomUUID } from "node:crypto";

import type { CompetitionLifecycleApiResponse } from "../api/competition-lifecycle-api.schema";
import { resolveCompetitionLifecycle } from "../model/competition-lifecycle.policy";
import type {
  CompetitionLifecyclePolicyInput,
  CompetitionLifecycleScenario,
} from "../model/competition-lifecycle.types";

export type MockCompetitionLifecycleResponse = {
  status: number;
  requestId: string;
  body: CompetitionLifecycleApiResponse;
};

const baseInput: Omit<CompetitionLifecyclePolicyInput, "competitionId"> = {
  exists: true,
  lifecycle: "registration_open",
  eligibility: "eligible",
  authorization: "authorized",
  system: "available",
  registeredCount: 128,
  capacity: 256,
  waitlistEnabled: true,
  partialFailure: false,
};

const scenarioPatch: Record<
  CompetitionLifecycleScenario,
  Partial<Omit<CompetitionLifecyclePolicyInput, "competitionId">>
> = {
  normal: {},
  registration_closed: { lifecycle: "registration_closed" },
  waitlist: { registeredCount: 256, waitlistEnabled: true },
  not_eligible: { eligibility: "not_eligible" },
  full_capacity: { registeredCount: 256, waitlistEnabled: false },
  cancelled: { lifecycle: "cancelled" },
  offline: { system: "offline" },
  partial_failure: { partialFailure: true },
  unauthorized: { authorization: "unauthorized" },
  forbidden: { authorization: "forbidden" },
  not_found: { exists: false },
  maintenance: { system: "maintenance" },
};

const transportFailure: Partial<
  Record<CompetitionLifecycleScenario, { status: number; retryable: boolean }>
> = {
  offline: { status: 503, retryable: true },
  unauthorized: { status: 401, retryable: false },
  forbidden: { status: 403, retryable: false },
  not_found: { status: 404, retryable: false },
  maintenance: { status: 503, retryable: true },
};

export function getMockCompetitionLifecycleInput(
  competitionId: string,
  scenario: CompetitionLifecycleScenario,
): CompetitionLifecyclePolicyInput {
  return {
    competitionId,
    ...baseInput,
    ...scenarioPatch[scenario],
  };
}

export function getMockCompetitionLifecycleResponse(
  competitionId: string,
  scenario: CompetitionLifecycleScenario,
): MockCompetitionLifecycleResponse {
  const requestId = `mock-m6-lifecycle-${randomUUID()}`;
  const decision = resolveCompetitionLifecycle(
    getMockCompetitionLifecycleInput(competitionId, scenario),
  );
  const failure = transportFailure[scenario];

  if (failure) {
    return {
      status: failure.status,
      requestId,
      body: {
        ok: false,
        error: {
          code: decision.disposition,
          message: decision.message,
          request_id: requestId,
          retryable: failure.retryable,
        },
      },
    };
  }

  const serverNow = new Date().toISOString();
  return {
    status: 200,
    requestId,
    body: {
      ok: true,
      data: {
        competition_id: decision.competitionId,
        lifecycle: decision.lifecycle,
        scenario,
        disposition: decision.disposition,
        title: decision.title,
        message: decision.message,
        severity: decision.severity,
        primary_action: decision.primaryAction,
        entry_allowed: decision.entryAllowed,
        waitlist_allowed: decision.waitlistAllowed,
        blocking: decision.blocking,
        retryable: decision.retryable,
        registered_count: decision.registeredCount,
        capacity: decision.capacity,
      },
      meta: {
        request_id: requestId,
        server_now: serverNow,
        last_updated_at: serverNow,
        freshness: "fresh",
      },
    },
  };
}
