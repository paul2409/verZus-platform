import { z } from "zod";

const isoDateTimeSchema = z.string().datetime({ offset: true });

const apiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  request_id: z.string().min(1),
  retryable: z.boolean(),
  field_errors: z.record(z.string(), z.array(z.string())),
});

const responseMetaSchema = z.object({
  server_now: isoDateTimeSchema,
  last_updated_at: isoDateTimeSchema,
  freshness: z.enum(["fresh", "stale"]),
});

export const competitionEntryRecordRawSchema = z.object({
  entry_id: z.string().min(1),
  competition_id: z.string().min(1),
  competition_name: z.string().min(1),
  state: z.literal("confirmed"),
  state_label: z.string().min(1),
  entrant_label: z.string().min(1),
  team_label: z.string().min(1),
  registered_at: isoDateTimeSchema,
  registered_at_label: z.string().min(1),
  registration_code: z.string().min(1),
  entry_fee_label: z.string().min(1),
  check_in_label: z.string().min(1),
});

const controlRawSchema = z.object({
  competition_id: z.string().min(1),
  competition_name: z.string().min(1),
  lifecycle_state: z.enum([
    "scheduled",
    "registration_open",
    "registration_closed",
    "check_in_open",
    "in_progress",
    "completed",
    "cancelled",
  ]),
  lifecycle_label: z.string().min(1),
  state_version: z.string().min(1),
  can_enter: z.boolean(),
  eligibility_state: z.enum(["eligible", "not_eligible", "pending"]),
  eligibility_label: z.string().min(1),
  eligibility_summary: z.string().min(1),
  entrant_label: z.string().min(1),
  team_label: z.string().min(1),
  game_label: z.string().min(1),
  format_label: z.string().min(1),
  entry_fee_label: z.string().min(1),
  roster_lock_label: z.string().min(1),
  check_in_label: z.string().min(1),
  existing_entry: competitionEntryRecordRawSchema.nullable(),
});

export const competitionEntryCommandRawSchema = z.object({
  competition_id: z.string().min(1),
  expected_state_version: z.string().min(1),
  idempotency_key: z.string().uuid(),
  accepted_terms: z.literal(true),
});

function successSchema<TSchema extends z.ZodType>(data: TSchema) {
  return z.object({
    ok: z.literal(true),
    data,
    request_id: z.string().min(1),
    meta: responseMetaSchema,
  });
}

const failureSchema = z.object({ ok: z.literal(false), error: apiErrorSchema });

export const competitionEntryControlResponseSchema = z.discriminatedUnion("ok", [
  successSchema(controlRawSchema),
  failureSchema,
]);

export const competitionEntryMutationResponseSchema = z.discriminatedUnion("ok", [
  successSchema(
    z.object({
      entry: competitionEntryRecordRawSchema,
      duplicate: z.boolean(),
      already_entered: z.boolean(),
    }),
  ),
  failureSchema,
]);

export type CompetitionEntryApiErrorRaw = z.infer<typeof apiErrorSchema>;
export type CompetitionEntryCommandRaw = z.infer<typeof competitionEntryCommandRawSchema>;
export type CompetitionEntryRecordRaw = z.infer<typeof competitionEntryRecordRawSchema>;
