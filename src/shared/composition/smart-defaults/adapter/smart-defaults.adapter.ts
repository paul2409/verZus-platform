import type { SmartDefaultsSnapshot } from "../model";
import type { SmartDefaultsResponse } from "../schema";

export function adaptSmartDefaultsResponse(response: SmartDefaultsResponse): SmartDefaultsSnapshot {
  const data = response.data;

  return {
    version: data.version,
    identity: data.identity
      ? {
          gameId: data.identity.game_id,
          gameName: data.identity.game_name,
          gameFilter: data.identity.game_filter,
          platform: data.identity.platform,
          platformHandle: data.identity.platform_handle,
        }
      : null,
    location: data.location
      ? {
          countryCode: data.location.country_code,
          region: data.location.region,
          city: data.location.city,
          timezone: data.location.timezone,
        }
      : null,
    availability: data.availability.map((slot) => ({
      day: slot.day,
      startTime: slot.start_time,
      endTime: slot.end_time,
      timezone: slot.timezone,
    })),
    competition: data.competition,
    leaderboard: data.leaderboard,
    search: data.search,
    crewCreation: data.crew_creation
      ? {
          primaryGame: data.crew_creation.primary_game,
          region: data.crew_creation.region,
        }
      : null,
    sources: {
      competitionGame: data.sources.competition_game,
      competitionSort: data.sources.competition_sort,
      leaderboardMode: data.sources.leaderboard_mode,
      leaderboardGame: data.sources.leaderboard_game,
      searchDomain: data.sources.search_domain,
      crewCreation: data.sources.crew_creation,
    },
    generatedAt: data.generated_at,
  };
}
