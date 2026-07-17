// VERZUS M8.10 LEADERBOARD RELEASE CONFIGURATION

export type LeaderboardReleaseConfig = {
  appEnvironment: string;
  releaseSha: string;
  leaderboardsEnabled: boolean;
  entityIntelEnabled: boolean;
};

function enabledUnlessFalse(value: string | undefined): boolean {
  return value?.trim().toLowerCase() !== "false";
}

export function getLeaderboardReleaseConfig(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): LeaderboardReleaseConfig {
  return {
    appEnvironment: environment.NEXT_PUBLIC_APP_ENV ?? "local",
    releaseSha: environment.NEXT_PUBLIC_RELEASE_SHA ?? "development",
    leaderboardsEnabled: enabledUnlessFalse(environment.NEXT_PUBLIC_ENABLE_M8_LEADERBOARDS),
    entityIntelEnabled: enabledUnlessFalse(environment.NEXT_PUBLIC_ENABLE_M8_ENTITY_INTEL),
  };
}
