// VERZUS M9.4 CREW RESOURCE TYPES

import type {
  CrewFoundationAchievement,
  CrewFoundationActivity,
  CrewFoundationIdentity,
  CrewFoundationMember,
  CrewFoundationRequest,
  CrewFoundationStats,
  CrewFoundationViewModel,
} from "../../foundation";

export const crewResourceNames = [
  "profile",
  "roster",
  "requests",
  "activity",
  "rankings",
  "achievements",
  "settings",
] as const;

export const crewResourceScenarios = [
  "normal",
  "stale",
  "empty",
  "error",
  "malformed",
  "slow",
] as const;

export type CrewResourceName = (typeof crewResourceNames)[number];
export type CrewResourceScenario = (typeof crewResourceScenarios)[number];
export type CrewResourceFreshness = "fresh" | "stale";
export type CrewResourceHealthState = "loading" | "success" | "stale" | "error";

export type CrewResourceMeta = {
  requestId: string;
  fetchedAt: string;
  freshness: CrewResourceFreshness;
  source: "mock-crew-resource";
};

export type CrewProfileResource = { identity: CrewFoundationIdentity };
export type CrewRosterResource = { members: readonly CrewFoundationMember[] };
export type CrewRequestsResource = { requests: readonly CrewFoundationRequest[] };
export type CrewActivityResource = { activity: readonly CrewFoundationActivity[] };
export type CrewRankingsResource = { stats: CrewFoundationStats };
export type CrewAchievementsResource = {
  achievements: readonly CrewFoundationAchievement[];
};
export type CrewSettingsResource = { settings: CrewFoundationViewModel["settings"] };

export type CrewResourceDataMap = {
  profile: CrewProfileResource;
  roster: CrewRosterResource;
  requests: CrewRequestsResource;
  activity: CrewActivityResource;
  rankings: CrewRankingsResource;
  achievements: CrewAchievementsResource;
  settings: CrewSettingsResource;
};

export type CrewResourceSnapshot<K extends CrewResourceName> = {
  data: CrewResourceDataMap[K];
  meta: CrewResourceMeta;
};

export type CrewResourceSnapshotMap = {
  [K in CrewResourceName]?: CrewResourceSnapshot<K>;
};

export type CrewResourceHealth = {
  name: CrewResourceName;
  state: CrewResourceHealthState;
  requestId: string | null;
  message: string | null;
  retryable: boolean;
};

export function parseCrewResourceName(value: unknown): CrewResourceName | undefined {
  return typeof value === "string" && crewResourceNames.includes(value as CrewResourceName)
    ? (value as CrewResourceName)
    : undefined;
}

export function parseCrewResourceScenario(value: unknown): CrewResourceScenario {
  return typeof value === "string" && crewResourceScenarios.includes(value as CrewResourceScenario)
    ? (value as CrewResourceScenario)
    : "normal";
}
