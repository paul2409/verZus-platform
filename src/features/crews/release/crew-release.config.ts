// VERZUS M9.8 CREW RELEASE CONFIGURATION

export type CrewReleaseConfig = {
  appEnvironment: string;
  releaseSha: string;
  crewsEnabled: boolean;
};

function enabledUnlessFalse(value: string | undefined): boolean {
  return value?.trim().toLowerCase() !== "false";
}

export function getCrewReleaseConfig(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): CrewReleaseConfig {
  return {
    appEnvironment: environment.NEXT_PUBLIC_APP_ENV ?? "local",
    releaseSha: environment.NEXT_PUBLIC_RELEASE_SHA ?? "development",
    crewsEnabled: enabledUnlessFalse(environment.NEXT_PUBLIC_ENABLE_M9_CREWS),
  };
}
