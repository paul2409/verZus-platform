// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.5 PERSONALIZED ACTIVITY FEED TYPES

export type ActivityFeedDomain =
  | "all"
  | "matches"
  | "competitions"
  | "crews"
  | "rewards"
  | "rankings"
  | "profile";

export type ActivityFeedItemDomain = Exclude<ActivityFeedDomain, "all">;
export type ActivityFeedTone = "cyan" | "green" | "gold" | "magenta" | "violet";
export type ActivityActorKind = "player" | "crew" | "platform";
export type ActivityVisibility = "public" | "crew" | "private";

export type ActivityFeedScenario =
  | "normal"
  | "empty"
  | "slow"
  | "error"
  | "offline"
  | "malformed"
  | "stale"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "maintenance"
  | "partial";

export type ActivityFeedActor = {
  id: string;
  kind: ActivityActorKind;
  name: string;
  handle: string | null;
  initials: string;
  artworkUrl: string | null;
  verified: boolean;
};

export type ActivityFeedItem = {
  id: string;
  domain: ActivityFeedItemDomain;
  verb: string;
  title: string;
  description: string;
  actor: ActivityFeedActor;
  occurredAt: string;
  href: string;
  actionLabel: string;
  contextLabel: string;
  metric: string | null;
  tone: ActivityFeedTone;
  visibility: ActivityVisibility;
  personalizationReason: string;
};

export type ActivityFeedPageMeta = {
  requestId: string;
  fetchedAt: string;
  freshness: "fresh" | "stale";
  domain: ActivityFeedDomain;
  pageSize: number;
  nextCursor: string | null;
  hasNextPage: boolean;
  totalVisible: number;
  personalization: "viewer";
};

export type ActivityFeedPage = {
  items: ActivityFeedItem[];
  meta: ActivityFeedPageMeta;
};

export type ActivityFeedErrorShape = {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
  status?: number;
};
