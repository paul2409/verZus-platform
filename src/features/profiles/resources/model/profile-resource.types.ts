// VERZUS M11.4 PROFILE RESOURCE TYPES

import type {
  PlayerAvailability,
  PlayerCrewIdentity,
  PlayerProfileIdentity,
  PlayerProfileStats,
} from "../../foundation";

export type ProfileResourceName = "identity" | "competitive-summary" | "crew" | "availability";

export type ProfileResourceScenario =
  | "normal"
  | "stale"
  | "empty"
  | "error"
  | "offline"
  | "slow"
  | "malformed"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "maintenance";

export type ProfileResourceFreshness = "fresh" | "stale";

export type ProfileResourceMeta = {
  requestId: string;
  fetchedAt: string;
  freshness: ProfileResourceFreshness;
  source: string;
  version: number;
};

export type ProfileResourceDataMap = {
  identity: PlayerProfileIdentity;
  "competitive-summary": PlayerProfileStats;
  crew: PlayerCrewIdentity | null;
  availability: PlayerAvailability;
};

export type ProfileResourceSnapshot<Name extends ProfileResourceName> = {
  name: Name;
  data: ProfileResourceDataMap[Name];
  meta: ProfileResourceMeta;
};

export type ProfileResourceSnapshotMap = Partial<{
  [Name in ProfileResourceName]: ProfileResourceSnapshot<Name>;
}>;

export type ProfileResourceHealthState =
  | "loading"
  | "success"
  | "empty"
  | "stale"
  | "retrying"
  | "error"
  | "offline"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "maintenance";

export type ProfileResourceHealth = {
  name: ProfileResourceName;
  state: ProfileResourceHealthState;
  code: string | null;
  requestId: string | null;
  message: string | null;
  retryable: boolean;
};
