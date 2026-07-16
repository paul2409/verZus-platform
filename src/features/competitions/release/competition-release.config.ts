// VERZUS M6.7 COMPETITION RELEASE GATE

export type CompetitionReleaseMetadata = {
  stage: "6.7";
  environment: string;
  release: string;
  enabled: boolean;
};

export function isCompetitionFeatureEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_M6_COMPETITIONS !== "false";
}

export function getCompetitionReleaseMetadata(): CompetitionReleaseMetadata {
  return {
    stage: "6.7",
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? "local",
    release: process.env.NEXT_PUBLIC_RELEASE_SHA ?? "local",
    enabled: isCompetitionFeatureEnabled(),
  };
}
