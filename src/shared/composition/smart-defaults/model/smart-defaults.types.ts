export const smartCompetitionGames = [
  "all",
  "ea-fc",
  "cod-mobile",
  "clash-royale",
  "league-of-legends",
] as const;
export const smartCompetitionSorts = [
  "starts-soon",
  "popular",
  "prize-high",
  "availability",
] as const;
export const smartLeaderboardModes = ["weekly", "pools", "game", "crew", "combine"] as const;
export const smartLeaderboardGames = [
  "all",
  "ea-fc",
  "cod-mobile",
  "clash-royale",
  "league",
] as const;
export const smartSearchDomains = ["all", "players", "crews", "competitions", "matches"] as const;

export type SmartCompetitionGame = (typeof smartCompetitionGames)[number];
export type SmartCompetitionSort = (typeof smartCompetitionSorts)[number];
export type SmartLeaderboardMode = (typeof smartLeaderboardModes)[number];
export type SmartLeaderboardGame = (typeof smartLeaderboardGames)[number];
export type SmartSearchDomain = (typeof smartSearchDomains)[number];
export type SmartDefaultSource = "explicit" | "profile" | "history" | "fallback";

export type SmartDefaultsSnapshot = {
  version: number;
  identity: {
    gameId: string;
    gameName: string;
    gameFilter: Exclude<SmartCompetitionGame, "all">;
    platform: string;
    platformHandle: string;
  } | null;
  location: {
    countryCode: string | null;
    region: string | null;
    city: string | null;
    timezone: string | null;
  } | null;
  availability: Array<{
    day: string;
    startTime: string;
    endTime: string;
    timezone: string;
  }>;
  competition: {
    game: SmartCompetitionGame;
    sort: SmartCompetitionSort;
    region: string | null;
  };
  leaderboard: {
    mode: SmartLeaderboardMode;
    game: SmartLeaderboardGame;
  };
  search: {
    domain: SmartSearchDomain;
  };
  crewCreation: {
    primaryGame: "EA FC" | "COD Mobile" | "Clash Royale" | "League of Legends";
    region: "Nigeria" | "West Africa" | "Global";
  } | null;
  sources: {
    competitionGame: SmartDefaultSource;
    competitionSort: SmartDefaultSource;
    leaderboardMode: SmartDefaultSource;
    leaderboardGame: SmartDefaultSource;
    searchDomain: SmartDefaultSource;
    crewCreation: SmartDefaultSource;
  };
  generatedAt: string;
};

export type SmartPreferencePatch = {
  competitionGame?: SmartCompetitionGame | undefined;
  competitionSort?: SmartCompetitionSort | undefined;
  leaderboardMode?: SmartLeaderboardMode | undefined;
  leaderboardGame?: SmartLeaderboardGame | undefined;
  searchDomain?: SmartSearchDomain | undefined;
};
