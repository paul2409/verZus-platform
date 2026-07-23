import type { IconName } from "@/components/primitives/icon";

export type ShellNavigationAvailability =
  "available" | "partial" | "disabled" | "loading" | "error";

export type ShellNavigationState = ShellNavigationAvailability | "feature-flagged";
export type ShellNavigationMatch = "exact" | "prefix";
export type ShellFeatureFlags = Readonly<Record<string, boolean>>;
export type ShellNavigationRuntimeStates = Readonly<Record<string, ShellNavigationAvailability>>;

export type ShellNavigationSection = "main" | "community" | "account";

export type ShellNavigationNotification = {
  count?: number | undefined;
  dot?: boolean | undefined;
  label: string;
  tone?: "neutral" | "primary" | "warning" | "danger" | undefined;
};

export type ShellNavigationItem = {
  id: string;
  href: string;
  label: string;
  shortLabel?: string | undefined;
  icon: IconName;
  section?: ShellNavigationSection | undefined;
  match?: ShellNavigationMatch | undefined;
  activePrefixes?: readonly string[] | undefined;
  state?: ShellNavigationState | undefined;
  featureFlag?: string | undefined;
  badgeCount?: number | undefined;
  notification?: ShellNavigationNotification | undefined;
  offlineSafe?: boolean | undefined;
};

export type ResolvedShellNavigationItem = {
  item: ShellNavigationItem;
  state: ShellNavigationState;
  current: boolean;
  disabled: boolean;
  reason: string | null;
};

export type ShellProfile = {
  name: string;
  handle?: string | undefined;
  title?: string | undefined;
  initials?: string | undefined;
  avatarSrc?: string | undefined;
  presence?: "online" | "offline" | "away" | "busy" | undefined;
  points?: number | undefined;
  crewName?: string | undefined;
};

export type GlobalShellStatus = {
  kind: "operational" | "degraded" | "offline" | "maintenance";
  label: string;
  detail?: string | undefined;
};
