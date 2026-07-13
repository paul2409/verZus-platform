import type { GlobalShellStatus, ShellFeatureFlags, ShellProfile } from "./shell.types";

export const defaultPlatformProfile: ShellProfile = {
  name: "Jayflex",
  handle: "@jayflex",
  title: "Elite Competitor",
  initials: "JF",
  presence: "online",
  points: 2310,
  crewName: "Mainland Titans",
};

export const defaultPlatformStatus: GlobalShellStatus = {
  kind: "operational",
  label: "Online",
  detail: "All systems operational",
};

export const defaultPlatformFeatureFlags: ShellFeatureFlags = {
  crews: true,
  rewards: true,
  settings: true,
};
