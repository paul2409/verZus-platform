import { z } from "zod";

const isoDateTimeSchema = z.string().datetime({ offset: true });

export const competitionDiscoveryApiErrorRawSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  request_id: z.string().min(1),
  retryable: z.boolean(),
  field_errors: z.record(z.string(), z.array(z.string())),
});

export type CompetitionDiscoveryApiErrorRaw = z.infer<typeof competitionDiscoveryApiErrorRawSchema>;

export const competitionDiscoveryApiFailureSchema = z.object({
  ok: z.literal(false),
  error: competitionDiscoveryApiErrorRawSchema,
});

const responseMetaRawSchema = z.object({
  server_now: isoDateTimeSchema,
  last_updated_at: isoDateTimeSchema,
  freshness: z.enum(["fresh", "stale"]),
});

const featuredRawSchema = z.object({
  competition_id: z.string().min(1),
  eyebrow: z.string().min(1),
  name: z.string().min(1),
  season_label: z.string().min(1),
  week_label: z.string().min(1),
  game_label: z.string().min(1),
  format_label: z.string().min(1),
  prize_pool_label: z.string().min(1),
  reward_note: z.string().min(1),
  countdown_label: z.string().min(1),
  status_label: z.string().min(1),
  art_key: z.enum(["championship", "ea-fc", "cod-mobile", "clash-royale", "league-of-legends"]),
});

const competitionItemRawSchema = z.object({
  competition_id: z.string().min(1),
  name: z.string().min(1),
  game: z.string().min(1),
  game_filter_value: z.enum(["ea-fc", "cod-mobile", "clash-royale", "league-of-legends"]),
  team_size: z.enum(["1V1", "4V4", "5V5"]),
  format: z.string().min(1),
  state: z.enum(["live", "upcoming", "entered"]),
  status_label: z.string().min(1),
  capacity_label: z.string().min(1),
  timing_label: z.string().min(1),
  prize_pool_label: z.string().min(1).nullable(),
  entry_fee_label: z.string().min(1),
  entry_fee_type: z.enum(["free", "paid"]),
  popularity: z.number().int().min(0),
  starts_at_order: z.number().int().min(0),
  prize_value: z.number().min(0),
  remaining_capacity: z.number().int().min(0),
  search_terms: z.array(z.string()),
  art_key: z.enum(["championship", "ea-fc", "cod-mobile", "clash-royale", "league-of-legends"]),
});

const journeyStepRawSchema = z.object({
  id: z.string().min(1),
  number: z.number().int().positive(),
  label: z.string().min(1),
  description: z.string().min(1),
});

const guideLinkRawSchema = z.object({ id: z.string().min(1), label: z.string().min(1) });
const optionRawSchema = z.object({ value: z.string().min(1), label: z.string().min(1) });

const filterOptionsRawSchema = z.object({
  tabs: z.array(optionRawSchema),
  games: z.array(optionRawSchema),
  team_sizes: z.array(optionRawSchema),
  entry_fees: z.array(optionRawSchema),
  sorts: z.array(optionRawSchema),
});

const currentEntryRawSchema = z.object({
  entry_id: z.string().min(1),
  competition_name: z.string().min(1),
  state_label: z.string().min(1),
  team_label: z.string().min(1),
  status_label: z.string().min(1),
});

function successSchema<TSchema extends z.ZodType>(data: TSchema) {
  return z.object({
    ok: z.literal(true),
    data,
    request_id: z.string().min(1),
    meta: responseMetaRawSchema,
  });
}

export const featuredCompetitionResponseSchema = z.discriminatedUnion("ok", [
  successSchema(featuredRawSchema.nullable()),
  competitionDiscoveryApiFailureSchema,
]);

export const competitionDiscoveryListResponseSchema = z.discriminatedUnion("ok", [
  successSchema(
    z.object({
      items: z.array(competitionItemRawSchema),
      page: z.number().int().positive(),
      page_count: z.number().int().positive(),
      total: z.number().int().min(0),
      has_previous_page: z.boolean(),
      has_next_page: z.boolean(),
    }),
  ),
  competitionDiscoveryApiFailureSchema,
]);

export const competitionDiscoveryMetadataResponseSchema = z.discriminatedUnion("ok", [
  successSchema(
    z.object({
      journey: z.array(journeyStepRawSchema),
      guide_links: z.array(guideLinkRawSchema),
      filter_options: filterOptionsRawSchema,
    }),
  ),
  competitionDiscoveryApiFailureSchema,
]);

export const currentCompetitionEntryResponseSchema = z.discriminatedUnion("ok", [
  successSchema(currentEntryRawSchema.nullable()),
  competitionDiscoveryApiFailureSchema,
]);
