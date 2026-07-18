// VERZUS M10.8 REWARD RELEASE CONFIGURATION

export type RewardReleaseConfig = {
  appEnvironment: string;
  releaseSha: string;
  rewardsEnabled: boolean;
};

function enabledUnlessFalse(value: string | undefined): boolean {
  return value?.trim().toLowerCase() !== "false";
}

export function getRewardReleaseConfig(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): RewardReleaseConfig {
  return {
    appEnvironment: environment.NEXT_PUBLIC_APP_ENV ?? "local",
    releaseSha: environment.NEXT_PUBLIC_RELEASE_SHA ?? "development",
    rewardsEnabled: enabledUnlessFalse(environment.NEXT_PUBLIC_ENABLE_M10_REWARDS),
  };
}
