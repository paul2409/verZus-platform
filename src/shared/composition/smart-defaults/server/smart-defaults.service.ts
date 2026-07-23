import type {
  SmartCompetitionGame,
  SmartDefaultSource,
  SmartDefaultsSnapshot,
  SmartLeaderboardGame,
} from "../model";
import type { SmartDefaultsSources } from "./smart-defaults.repository";

function leaderboardGameFromCompetition(game: SmartCompetitionGame): SmartLeaderboardGame {
  if (game === "league-of-legends") return "league";
  return game;
}

function crewGameFromFilter(
  game: Exclude<SmartCompetitionGame, "all">,
): NonNullable<SmartDefaultsSnapshot["crewCreation"]>["primaryGame"] {
  return {
    "ea-fc": "EA FC",
    "cod-mobile": "COD Mobile",
    "clash-royale": "Clash Royale",
    "league-of-legends": "League of Legends",
  }[game];
}

function crewRegionFromProfile(
  profile: SmartDefaultsSources["profile"],
): NonNullable<SmartDefaultsSnapshot["crewCreation"]>["region"] {
  if (profile?.country_code?.toUpperCase() === "NG") return "Nigeria";
  if (profile?.region?.toLowerCase().includes("west africa")) return "West Africa";
  return "Global";
}

function source(explicit: unknown, fallback: SmartDefaultSource): SmartDefaultSource {
  return explicit === null || explicit === undefined ? fallback : "explicit";
}

export function buildSmartDefaultsSnapshot(
  sources: SmartDefaultsSources,
  now = new Date(),
): SmartDefaultsSnapshot {
  const profileGame = sources.identity?.game_filter ?? null;
  const competitionGame = sources.preferences?.competition_game ?? profileGame ?? "all";
  const leaderboardGame =
    sources.preferences?.leaderboard_game ?? leaderboardGameFromCompetition(profileGame ?? "all");
  const searchDomain = sources.preferences?.search_domain ?? sources.recentSearchDomain ?? "all";

  return {
    version: sources.preferences?.version ?? 0,
    identity: sources.identity
      ? {
          gameId: sources.identity.game_id,
          gameName: sources.identity.game_name,
          gameFilter: sources.identity.game_filter,
          platform: sources.identity.platform,
          platformHandle: sources.identity.platform_handle,
        }
      : null,
    location: sources.profile
      ? {
          countryCode: sources.profile.country_code,
          region: sources.profile.region,
          city: sources.profile.city,
          timezone: sources.profile.timezone,
        }
      : null,
    availability: sources.availability.map((slot) => ({
      day: slot.day_of_week,
      startTime: slot.start_time.slice(0, 5),
      endTime: slot.end_time.slice(0, 5),
      timezone: slot.timezone,
    })),
    competition: {
      game: competitionGame,
      sort: sources.preferences?.competition_sort ?? "starts-soon",
      region: sources.profile?.region ?? sources.profile?.country_code ?? null,
    },
    leaderboard: {
      mode: sources.preferences?.leaderboard_mode ?? "weekly",
      game: leaderboardGame,
    },
    search: { domain: searchDomain },
    crewCreation: sources.identity
      ? {
          primaryGame: crewGameFromFilter(sources.identity.game_filter),
          region: crewRegionFromProfile(sources.profile),
        }
      : null,
    sources: {
      competitionGame: source(
        sources.preferences?.competition_game,
        profileGame ? "profile" : "fallback",
      ),
      competitionSort: source(sources.preferences?.competition_sort, "fallback"),
      leaderboardMode: source(sources.preferences?.leaderboard_mode, "fallback"),
      leaderboardGame: source(
        sources.preferences?.leaderboard_game,
        profileGame ? "profile" : "fallback",
      ),
      searchDomain: source(
        sources.preferences?.search_domain,
        sources.recentSearchDomain ? "history" : "fallback",
      ),
      crewCreation: sources.identity ? "profile" : "fallback",
    },
    generatedAt: now.toISOString(),
  };
}
