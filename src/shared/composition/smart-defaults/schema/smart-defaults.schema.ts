import { z } from "zod";

import {
  smartCompetitionGames,
  smartCompetitionSorts,
  smartLeaderboardGames,
  smartLeaderboardModes,
  smartSearchDomains,
} from "../model";

export const smartPreferencePatchSchema = z
  .object({
    competition_game: z.enum(smartCompetitionGames).optional(),
    competition_sort: z.enum(smartCompetitionSorts).optional(),
    leaderboard_mode: z.enum(smartLeaderboardModes).optional(),
    leaderboard_game: z.enum(smartLeaderboardGames).optional(),
    search_domain: z.enum(smartSearchDomains).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Provide at least one preference.");

const smartDefaultsDataSchema = z.object({
  version: z.number().int().nonnegative(),
  identity: z
    .object({
      game_id: z.string().min(1),
      game_name: z.string().min(1),
      game_filter: z.enum(["ea-fc", "cod-mobile", "clash-royale", "league-of-legends"]),
      platform: z.string().min(1),
      platform_handle: z.string().min(1),
    })
    .nullable(),
  location: z
    .object({
      country_code: z.string().nullable(),
      region: z.string().nullable(),
      city: z.string().nullable(),
      timezone: z.string().nullable(),
    })
    .nullable(),
  availability: z.array(
    z.object({
      day: z.string().min(1),
      start_time: z.string().min(1),
      end_time: z.string().min(1),
      timezone: z.string().min(1),
    }),
  ),
  competition: z.object({
    game: z.enum(smartCompetitionGames),
    sort: z.enum(smartCompetitionSorts),
    region: z.string().nullable(),
  }),
  leaderboard: z.object({
    mode: z.enum(smartLeaderboardModes),
    game: z.enum(smartLeaderboardGames),
  }),
  search: z.object({ domain: z.enum(smartSearchDomains) }),
  crew_creation: z
    .object({
      primary_game: z.enum(["EA FC", "COD Mobile", "Clash Royale", "League of Legends"]),
      region: z.enum(["Nigeria", "West Africa", "Global"]),
    })
    .nullable(),
  sources: z.object({
    competition_game: z.enum(["explicit", "profile", "history", "fallback"]),
    competition_sort: z.enum(["explicit", "profile", "history", "fallback"]),
    leaderboard_mode: z.enum(["explicit", "profile", "history", "fallback"]),
    leaderboard_game: z.enum(["explicit", "profile", "history", "fallback"]),
    search_domain: z.enum(["explicit", "profile", "history", "fallback"]),
    crew_creation: z.enum(["explicit", "profile", "history", "fallback"]),
  }),
  generated_at: z.string().datetime(),
});

export const smartDefaultsResponseSchema = z.object({
  data: smartDefaultsDataSchema,
  meta: z.object({
    request_id: z.string().min(1),
    fetched_at: z.string().datetime(),
  }),
});

export type SmartPreferencePatchRequest = z.infer<typeof smartPreferencePatchSchema>;
export type SmartDefaultsResponse = z.infer<typeof smartDefaultsResponseSchema>;
