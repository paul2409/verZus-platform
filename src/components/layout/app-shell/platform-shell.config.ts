import type { GlobalShellStatus, ShellFeatureFlags, ShellProfile } from "./shell.types";

export const defaultPlatformProfile: ShellProfile = {
  name: "Player",
  initials: "P",
  presence: "online",
  points: 0,
};

export const defaultPlatformStatus: GlobalShellStatus = {
  kind: "operational",
  label: "Connected",
  detail: "Production data is current.",
};

export const defaultPlatformFeatureFlags: ShellFeatureFlags = {
  crews: true,
  rewards: true,
  settings: true,
};
