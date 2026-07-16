import {
  competitionEntryControlResourceDataSchema,
  competitionEntryRecordSchema,
} from "../model/competition-entry.schema";
import type {
  CompetitionEntryControlResourceData,
  CompetitionEntryMutationResult,
  CompetitionEntryRecordViewModel,
} from "../model/competition-entry.types";
import {
  type CompetitionEntryApiErrorRaw,
  type CompetitionEntryRecordRaw,
  competitionEntryControlResponseSchema,
  competitionEntryMutationResponseSchema,
} from "./competition-entry-api.schema";

export class CompetitionEntryApiClientError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;

  constructor(input: { code: string; message: string; requestId: string; retryable: boolean }) {
    super(input.message);
    this.name = "CompetitionEntryApiClientError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
  }
}

function failure(error: CompetitionEntryApiErrorRaw) {
  return new CompetitionEntryApiClientError({
    code: error.code,
    message: error.message,
    requestId: error.request_id,
    retryable: error.retryable,
  });
}

function invalid(resource: string) {
  return new CompetitionEntryApiClientError({
    code: "invalid_response",
    message: `The competition ${resource} resource returned invalid data.`,
    requestId: `competition-entry-invalid-${resource}`,
    retryable: true,
  });
}

function adaptEntry(raw: CompetitionEntryRecordRaw): CompetitionEntryRecordViewModel {
  return competitionEntryRecordSchema.parse({
    entryId: raw.entry_id,
    competitionId: raw.competition_id,
    competitionName: raw.competition_name,
    state: raw.state,
    stateLabel: raw.state_label,
    entrantLabel: raw.entrant_label,
    teamLabel: raw.team_label,
    registeredAt: raw.registered_at,
    registeredAtLabel: raw.registered_at_label,
    registrationCode: raw.registration_code,
    entryFeeLabel: raw.entry_fee_label,
    checkInLabel: raw.check_in_label,
  });
}

export function adaptCompetitionEntryControl(
  payload: unknown,
): CompetitionEntryControlResourceData {
  const parsed = competitionEntryControlResponseSchema.safeParse(payload);
  if (!parsed.success) throw invalid("control");
  if (!parsed.data.ok) throw failure(parsed.data.error);

  const raw = parsed.data.data;
  return competitionEntryControlResourceDataSchema.parse({
    value: {
      competitionId: raw.competition_id,
      competitionName: raw.competition_name,
      lifecycleState: raw.lifecycle_state,
      lifecycleLabel: raw.lifecycle_label,
      stateVersion: raw.state_version,
      canEnter: raw.can_enter,
      eligibilityState: raw.eligibility_state,
      eligibilityLabel: raw.eligibility_label,
      eligibilitySummary: raw.eligibility_summary,
      entrantLabel: raw.entrant_label,
      teamLabel: raw.team_label,
      gameLabel: raw.game_label,
      formatLabel: raw.format_label,
      entryFeeLabel: raw.entry_fee_label,
      rosterLockLabel: raw.roster_lock_label,
      checkInLabel: raw.check_in_label,
      existingEntry: raw.existing_entry ? adaptEntry(raw.existing_entry) : null,
    },
    meta: {
      requestId: parsed.data.request_id,
      serverNow: parsed.data.meta.server_now,
      lastUpdatedAt: parsed.data.meta.last_updated_at,
      freshness: parsed.data.meta.freshness,
    },
  });
}

export function adaptCompetitionEntryMutation(payload: unknown): CompetitionEntryMutationResult {
  const parsed = competitionEntryMutationResponseSchema.safeParse(payload);
  if (!parsed.success) throw invalid("mutation");
  if (!parsed.data.ok) throw failure(parsed.data.error);

  return {
    entry: adaptEntry(parsed.data.data.entry),
    duplicate: parsed.data.data.duplicate,
    alreadyEntered: parsed.data.data.already_entered,
    requestId: parsed.data.request_id,
  };
}
