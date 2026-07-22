import { z } from "zod";

const playerFormResultSchema = z.enum(["W", "D", "L"]);

const recentMatchSchema = z.object({
  id: z.string().min(1),
  opponent_label: z.string().min(1),
  result: playerFormResultSchema,
  score_label: z.string().min(1),
  href: z.string().min(1),
});

export const playerIntelRawSchema = z.object({
  id: z.string().min(1),
  display_name: z.string().min(1),
  handle: z.string().min(1),
  subtitle: z.string().min(1),
  location_label: z.string().min(1),
  game_label: z.string().min(1),
  crew_name: z.string().min(1),
  avatar_src: z.string().min(1),
  rank: z.number().int().nonnegative(),
  trust: z.number().int().min(0).max(100),
  verified: z.boolean(),
  wins: z.number().int().min(0),
  win_rate_label: z.string().min(1),
  points_label: z.string().min(1),
  streak_label: z.string().min(1),
  recent_form: z.array(playerFormResultSchema).max(10),
  recent_matches: z.array(recentMatchSchema).max(5),
  achievement_preview: z.array(z.string().min(1)).max(6),
  profile_href: z.string().min(1),
  challenge_href: z.string().nullable(),
});

export const playerIntelEnvelopeSchema = z.object({
  data: playerIntelRawSchema,
  meta: z.object({
    request_id: z.string().min(1),
    fetched_at: z.string().datetime(),
    freshness: z.enum(["fresh", "stale", "partial"]),
    source: z.literal("profile-read-model"),
  }),
});

export const playerIntelErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
  }),
});

export type PlayerIntelRaw = z.infer<typeof playerIntelRawSchema>;
export type PlayerIntelEnvelopeRaw = z.infer<typeof playerIntelEnvelopeSchema>;
