import type {
  CompetitionLifecycleApiError,
  CompetitionLifecycleResource,
} from "../model/competition-lifecycle.types";
import { competitionLifecycleApiResponseSchema } from "./competition-lifecycle-api.schema";

export class CompetitionLifecycleApiClientError extends Error {
  readonly code: string;
  readonly requestId: string | null;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]>;

  constructor(error: CompetitionLifecycleApiError) {
    super(error.message);
    this.name = "CompetitionLifecycleApiClientError";
    this.code = error.code;
    this.requestId = error.requestId;
    this.retryable = error.retryable;
    this.fieldErrors = error.fieldErrors ?? {};
  }
}

export function adaptCompetitionLifecyclePayload(payload: unknown): CompetitionLifecycleResource {
  const parsed = competitionLifecycleApiResponseSchema.parse(payload);

  if (!parsed.ok) {
    throw new CompetitionLifecycleApiClientError({
      code: parsed.error.code,
      message: parsed.error.message,
      requestId: parsed.error.request_id,
      retryable: parsed.error.retryable,
      ...(parsed.error.field_errors ? { fieldErrors: parsed.error.field_errors } : {}),
    });
  }

  return {
    competitionId: parsed.data.competition_id,
    lifecycle: parsed.data.lifecycle,
    scenario: parsed.data.scenario,
    disposition: parsed.data.disposition,
    title: parsed.data.title,
    message: parsed.data.message,
    severity: parsed.data.severity,
    primaryAction: parsed.data.primary_action,
    entryAllowed: parsed.data.entry_allowed,
    waitlistAllowed: parsed.data.waitlist_allowed,
    blocking: parsed.data.blocking,
    retryable: parsed.data.retryable,
    registeredCount: parsed.data.registered_count,
    capacity: parsed.data.capacity,
    meta: {
      requestId: parsed.meta.request_id,
      serverNow: parsed.meta.server_now,
      lastUpdatedAt: parsed.meta.last_updated_at,
      freshness: parsed.meta.freshness,
    },
  };
}
