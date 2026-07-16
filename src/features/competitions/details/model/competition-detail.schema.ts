import { z } from "zod";

import { competitionResourceMetaSchema } from "../../discovery/model/competition-discovery.schema";

export const competitionDetailScenarioSchema = z.enum([
  "normal",
  "stale",
  "partial_failure",
  "offline",
  "maintenance",
  "unauthorized",
  "forbidden",
  "not_found",
  "malformed",
]);

export const competitionSummarySchema = z.object({
  id: z.string().min(1),
  eyebrow: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  statusLabel: z.string().min(1),
  seasonLabel: z.string().min(1),
  weekLabel: z.string().min(1),
  gameLabel: z.string().min(1),
  formatLabel: z.string().min(1),
  regionLabel: z.string().min(1),
  teamSizeLabel: z.string().min(1),
  capacityLabel: z.string().min(1),
  entryFeeLabel: z.string().min(1),
  prizePoolLabel: z.string().min(1),
  rewardNote: z.string().min(1),
  countdownLabel: z.string().min(1),
  artKey: z.enum(["championship", "ea-fc", "cod-mobile", "clash-royale", "league-of-legends"]),
  tags: z.array(z.string().min(1)),
});

export const competitionEligibilitySchema = z.object({
  state: z.enum(["eligible", "not_eligible", "pending"]),
  label: z.string().min(1),
  summary: z.string().min(1),
  checks: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      detail: z.string().min(1),
      met: z.boolean(),
    }),
  ),
});

export const competitionScheduleSchema = z.object({
  timezoneLabel: z.string().min(1),
  stages: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      dateLabel: z.string().min(1),
      timeLabel: z.string().min(1),
      status: z.enum(["complete", "current", "upcoming"]),
    }),
  ),
});

export const competitionRewardsSchema = z.object({
  prizePoolLabel: z.string().min(1),
  rewardNote: z.string().min(1),
  breakdown: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      valueLabel: z.string().min(1),
    }),
  ),
});

export const competitionRulesSchema = z.object({
  updatedLabel: z.string().min(1),
  sections: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      items: z.array(z.string().min(1)),
    }),
  ),
});

export const competitionParticipantsSchema = z.object({
  totalLabel: z.string().min(1),
  confirmedLabel: z.string().min(1),
  participants: z.array(
    z.object({
      id: z.string().min(1),
      seed: z.number().int().positive(),
      name: z.string().min(1),
      tag: z.string().min(1),
      statusLabel: z.string().min(1),
      avatarInitials: z.string().min(1).max(3),
    }),
  ),
});

export const competitionBracketSchema = z.object({
  statusLabel: z.string().min(1),
  rounds: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      matches: z.array(
        z.object({
          id: z.string().min(1),
          leftLabel: z.string().min(1),
          rightLabel: z.string().min(1),
          scoreLabel: z.string().min(1),
          state: z.enum(["scheduled", "live", "complete"]),
        }),
      ),
    }),
  ),
});

export function competitionDetailResourceDataSchema<TSchema extends z.ZodType>(schema: TSchema) {
  return z.object({ value: schema, meta: competitionResourceMetaSchema });
}
