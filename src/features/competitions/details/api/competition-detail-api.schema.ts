import { z } from "zod";

const apiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  request_id: z.string().min(1),
  retryable: z.boolean(),
  field_errors: z.record(z.string(), z.array(z.string())),
});

const metaSchema = z.object({
  server_now: z.string().datetime({ offset: true }),
  last_updated_at: z.string().datetime({ offset: true }),
  freshness: z.enum(["fresh", "stale"]),
});

const failureSchema = z.object({ ok: z.literal(false), error: apiErrorSchema });

function successSchema<TSchema extends z.ZodType>(data: TSchema) {
  return z.object({
    ok: z.literal(true),
    data,
    request_id: z.string().min(1),
    meta: metaSchema,
  });
}

export const summaryRawSchema = z.object({
  competition_id: z.string().min(1),
  eyebrow: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  status_label: z.string().min(1),
  season_label: z.string().min(1),
  week_label: z.string().min(1),
  game_label: z.string().min(1),
  format_label: z.string().min(1),
  region_label: z.string().min(1),
  team_size_label: z.string().min(1),
  capacity_label: z.string().min(1),
  entry_fee_label: z.string().min(1),
  prize_pool_label: z.string().min(1),
  reward_note: z.string().min(1),
  countdown_label: z.string().min(1),
  art_key: z.enum(["championship", "ea-fc", "cod-mobile", "clash-royale", "league-of-legends"]),
  tags: z.array(z.string().min(1)),
});

export const eligibilityRawSchema = z.object({
  state: z.enum(["eligible", "not_eligible", "pending"]),
  label: z.string().min(1),
  summary: z.string().min(1),
  checks: z.array(
    z.object({ id: z.string(), label: z.string(), detail: z.string(), met: z.boolean() }),
  ),
});

export const scheduleRawSchema = z.object({
  timezone_label: z.string().min(1),
  stages: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      date_label: z.string(),
      time_label: z.string(),
      status: z.enum(["complete", "current", "upcoming"]),
    }),
  ),
});

export const rewardsRawSchema = z.object({
  prize_pool_label: z.string().min(1),
  reward_note: z.string().min(1),
  breakdown: z.array(z.object({ id: z.string(), label: z.string(), value_label: z.string() })),
});

export const rulesRawSchema = z.object({
  updated_label: z.string().min(1),
  sections: z.array(z.object({ id: z.string(), title: z.string(), items: z.array(z.string()) })),
});

export const participantsRawSchema = z.object({
  total_label: z.string().min(1),
  confirmed_label: z.string().min(1),
  participants: z.array(
    z.object({
      participant_id: z.string(),
      seed: z.number().int().positive(),
      name: z.string(),
      tag: z.string(),
      status_label: z.string(),
      avatar_initials: z.string(),
    }),
  ),
});

export const bracketRawSchema = z.object({
  status_label: z.string().min(1),
  rounds: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      matches: z.array(
        z.object({
          id: z.string(),
          left_label: z.string(),
          right_label: z.string(),
          score_label: z.string(),
          state: z.enum(["scheduled", "live", "complete"]),
        }),
      ),
    }),
  ),
});

export const competitionDetailResponseSchemas = {
  summary: z.discriminatedUnion("ok", [successSchema(summaryRawSchema), failureSchema]),
  eligibility: z.discriminatedUnion("ok", [successSchema(eligibilityRawSchema), failureSchema]),
  schedule: z.discriminatedUnion("ok", [successSchema(scheduleRawSchema), failureSchema]),
  rewards: z.discriminatedUnion("ok", [successSchema(rewardsRawSchema), failureSchema]),
  rules: z.discriminatedUnion("ok", [successSchema(rulesRawSchema), failureSchema]),
  participants: z.discriminatedUnion("ok", [successSchema(participantsRawSchema), failureSchema]),
  bracket: z.discriminatedUnion("ok", [successSchema(bracketRawSchema), failureSchema]),
} as const;

export type CompetitionDetailApiErrorRaw = z.infer<typeof apiErrorSchema>;
