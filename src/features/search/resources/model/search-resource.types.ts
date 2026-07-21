// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.2 SEARCH RESOURCE TYPES

import type { SearchEntityDomain, SearchFoundationItem } from "../../foundation";

export type SearchResourceScenario =
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

export type SearchResourceState =
  | "idle"
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
  | "maintenance"
  | "schema-invalid"
  | "partial-failure";

export type SearchResourceMeta = {
  requestId: string;
  fetchedAt: string;
  freshness: "fresh" | "stale";
  source: string;
  domain: SearchEntityDomain;
  query: string;
  total: number;
};

export type SearchResourceSnapshot = {
  items: SearchFoundationItem[];
  meta: SearchResourceMeta;
};

export type SearchResourceHealth = {
  domain: SearchEntityDomain;
  state: SearchResourceState;
  code: string | null;
  message: string | null;
  requestId: string | null;
  retryable: boolean;
};

export type SearchResourceResult = {
  domain: SearchEntityDomain;
  items: SearchFoundationItem[];
  health: SearchResourceHealth;
  retry: () => Promise<void>;
};
