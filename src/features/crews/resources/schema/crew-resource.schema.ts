// VERZUS M9.4 CREW RAW API SCHEMAS

import { z } from "zod";

const lifecycleSchema = z.enum([
  "forming",
  "active",
  "inactive",
  "suspended",
  "disbanded",
  "archived",
]);
const roleSchema = z.enum(["owner", "captain", "manager", "member", "trial"]);
const freshnessSchema = z.enum(["fresh", "stale"]);

const metaSchema = z.object({
  request_id: z.string().min(1),
  fetched_at: z.string().datetime(),
  freshness: freshnessSchema,
  source: z.literal("postgres-crew-resource"),
});

const envelope = <T extends z.ZodTypeAny>(data: T) => z.object({ data, meta: metaSchema });

export const crewProfileEnvelopeSchema = envelope(
  z.object({
    identity: z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      tag: z.string().min(1).max(6),
      tagline: z.string(),
      description: z.string(),
      crest_src: z.string().min(1),
      banner_src: z.string().min(1),
      verified: z.boolean(),
      tier: z.string().min(1),
      games: z.array(z.string().min(1)),
      member_count: z.number().int().min(0),
      region: z.string().min(1),
      visibility: z.enum(["public", "private"]),
      founded_at_label: z.string().min(1),
      lifecycle: lifecycleSchema,
    }),
  }),
);

export const crewRosterEnvelopeSchema = envelope(
  z.object({
    members: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        handle: z.string().min(1),
        initials: z.string().min(1).max(4),
        role: roleSchema,
        contribution: z.number().int().min(0),
        status: z.enum(["online", "away", "offline"]),
      }),
    ),
  }),
);

export const crewRequestsEnvelopeSchema = envelope(
  z.object({
    requests: z.array(
      z.object({
        id: z.string().min(1),
        player_name: z.string().min(1),
        handle: z.string().min(1),
        game: z.string().min(1),
        trust: z.number().int().min(0).max(100),
        status: z.enum(["pending", "reviewing"]),
      }),
    ),
  }),
);

export const crewActivityEnvelopeSchema = envelope(
  z.object({
    activity: z.array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        game: z.string().min(1),
        occurred_at_label: z.string().min(1),
        score_label: z.string().nullable(),
        tone: z.enum(["win", "loss", "neutral"]),
      }),
    ),
  }),
);

export const crewRankingsEnvelopeSchema = envelope(
  z.object({
    stats: z.object({
      rank: z.number().int().nonnegative(),
      movement: z.number().int(),
      points: z.number().int().min(0),
      wins: z.number().int().min(0),
      losses: z.number().int().min(0),
      win_rate: z.number().min(0).max(100),
      streak: z.number().int().min(0),
      trust: z.number().int().min(0).max(100),
      active_members: z.number().int().min(0),
    }),
  }),
);

export const crewAchievementsEnvelopeSchema = envelope(
  z.object({
    achievements: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        description: z.string(),
        unlocked: z.boolean(),
      }),
    ),
  }),
);

export const crewSettingsEnvelopeSchema = envelope(
  z.object({
    settings: z.object({
      recruiting: z.boolean(),
      primary_game: z.string().min(1),
      language: z.string().min(1),
      minimum_rank: z.string().min(1),
      community_link_label: z.string().min(1),
    }),
  }),
);

export const crewResourceErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
  }),
});
