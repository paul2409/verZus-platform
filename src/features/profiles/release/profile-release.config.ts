// VERZUS M11.8 PROFILE RELEASE CONFIGURATION

export type ProfileReleaseConfig = {
  profilesEnabled: boolean;
  appEnvironment: string;
  releaseSha: string;
};

export function getProfileReleaseConfig(): ProfileReleaseConfig {
  return {
    profilesEnabled: process.env.NEXT_PUBLIC_ENABLE_M11_PROFILES !== "false",
    appEnvironment: process.env.NEXT_PUBLIC_APP_ENV ?? "local",
    releaseSha: process.env.NEXT_PUBLIC_RELEASE_SHA ?? "local",
  };
}
