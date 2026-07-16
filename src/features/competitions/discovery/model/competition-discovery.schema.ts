import { z } from "zod";

const isoDateTimeSchema = z.string().datetime({ offset: true });

export const competitionDiscoveryScenarioSchema = z.enum([
  "normal",
  "empty",
  "stale",
  "partial_failure",
  "offline",
  "maintenance",
  "unauthorized",
  "forbidden",
  "malformed",
]);

export const competitionResourceMetaSchema = z.object({
  requestId: z.string().min(1),
  serverNow: isoDateTimeSchema,
  lastUpdatedAt: isoDateTimeSchema,
  freshness: z.enum(["fresh", "stale"]),
});

export const featuredCompetitionSchema = z.object({
  id: z.string().min(1),
  eyebrow: z.string().min(1),
  name: z.string().min(1),
  seasonLabel: z.string().min(1),
  weekLabel: z.string().min(1),
  gameLabel: z.string().min(1),
  formatLabel: z.string().min(1),
  prizePoolLabel: z.string().min(1),
  rewardNote: z.string().min(1),
  countdownLabel: z.string().min(1),
  statusLabel: z.string().min(1),
  artKey: z.enum(["championship", "ea-fc", "cod-mobile", "clash-royale", "league-of-legends"]),
});

export const competitionJourneyStepSchema = z.object({
  id: z.string().min(1),
  number: z.number().int().positive(),
  label: z.string().min(1),
  description: z.string().min(1),
});

export const competitionDiscoveryItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  game: z.string().min(1),
  gameFilterValue: z.enum(["ea-fc", "cod-mobile", "clash-royale", "league-of-legends"]),
  teamSize: z.enum(["1V1", "4V4", "5V5"]),
  format: z.string().min(1),
  state: z.enum(["live", "upcoming", "entered"]),
  statusLabel: z.string().min(1),
  capacityLabel: z.string().min(1),
  timingLabel: z.string().min(1),
  prizePoolLabel: z.string().min(1).optional(),
  entryFeeLabel: z.string().min(1),
  entryFeeType: z.enum(["free", "paid"]),
  popularity: z.number().int().min(0),
  startsAtOrder: z.number().int().min(0),
  prizeValue: z.number().min(0),
  remainingCapacity: z.number().int().min(0),
  searchTerms: z.array(z.string()),
  artKey: z.enum(["championship", "ea-fc", "cod-mobile", "clash-royale", "league-of-legends"]),
});

export const competitionEntrySchema = z.object({
  id: z.string().min(1),
  competitionName: z.string().min(1),
  stateLabel: z.string().min(1),
  teamLabel: z.string().min(1),
  statusLabel: z.string().min(1),
});

export const competitionGuideLinkSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

const optionSchema = <TValues extends readonly [string, ...string[]]>(values: TValues) =>
  z.object({ value: z.enum(values), label: z.string().min(1) });

export const competitionFilterOptionsSchema = z.object({
  tabs: z.array(optionSchema(["all", "live", "upcoming", "entered", "popular"])),
  games: z.array(optionSchema(["all", "ea-fc", "cod-mobile", "clash-royale", "league-of-legends"])),
  teamSizes: z.array(optionSchema(["all", "1V1", "4V4", "5V5"])),
  entryFees: z.array(optionSchema(["all", "free", "paid"])),
  sorts: z.array(optionSchema(["starts-soon", "popular", "prize-high", "availability"])),
});

export const featuredCompetitionResourceDataSchema = z.object({
  competition: featuredCompetitionSchema.nullable(),
  meta: competitionResourceMetaSchema,
});

export const competitionListResourceDataSchema = z.object({
  items: z.array(competitionDiscoveryItemSchema),
  page: z.number().int().positive(),
  pageCount: z.number().int().positive(),
  total: z.number().int().min(0),
  hasPreviousPage: z.boolean(),
  hasNextPage: z.boolean(),
  meta: competitionResourceMetaSchema,
});

export const competitionMetadataResourceDataSchema = z.object({
  journey: z.array(competitionJourneyStepSchema),
  guideLinks: z.array(competitionGuideLinkSchema),
  filterOptions: competitionFilterOptionsSchema,
  meta: competitionResourceMetaSchema,
});

export const competitionEntryResourceDataSchema = z.object({
  entry: competitionEntrySchema.nullable(),
  meta: competitionResourceMetaSchema,
});
