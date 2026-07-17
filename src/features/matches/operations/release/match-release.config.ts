// VERZUS M7.8 MATCH OPERATIONS RELEASE GATE

export type MatchOperationsReleaseMetadata = {
  stage: "7.8";
  environment: string;
  release: string;
  enabled: boolean;
};

export function isMatchOperationsFeatureEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS !== "false";
}

export function getMatchOperationsReleaseMetadata(): MatchOperationsReleaseMetadata {
  return {
    stage: "7.8",
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? "local",
    release: process.env.NEXT_PUBLIC_RELEASE_SHA ?? "local",
    enabled: isMatchOperationsFeatureEnabled(),
  };
}
