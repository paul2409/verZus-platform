// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.5 SERVER-AUTHORITATIVE PERSONALIZED ACTIVITY FEED

import type {
  ActivityFeedDomain,
  ActivityFeedItem,
  ActivityFeedItemDomain,
  ActivityFeedScenario,
  ActivityVisibility,
} from "../model/activity-feed.types";

const VIEWER_ID = "player-prismo";
const VIEWER_CREW_IDS = new Set(["crew-xenon-esports"]);
const FOLLOWED_ACTOR_IDS = new Set([
  "player-rivalking",
  "player-jayflex",
  "crew-mainland-titans",
]);

const now = new Date("2026-07-21T14:00:00.000Z");
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString();
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();

type StoredActivityItem = ActivityFeedItem & {
  viewerIds: readonly string[];
  crewIds: readonly string[];
};

const activityRecords: readonly StoredActivityItem[] = [
  {
    id: "activity-match-prismo-win",
    domain: "matches",
    verb: "match_result_verified",
    title: "Your 4-2 result was verified",
    description: "The weekly-pool result against RivalKing is final and now counts toward your record.",
    actor: {
      id: VIEWER_ID,
      kind: "player",
      name: "Prismo",
      handle: "@prismo",
      initials: "PR",
      artworkUrl: null,
      verified: true,
    },
    occurredAt: minutesAgo(6),
    href: "/matches/match-player-prismo",
    actionLabel: "Open match",
    contextLabel: "EA FC 26 · Weekly Pool",
    metric: "+75 XP",
    tone: "green",
    visibility: "private",
    personalizationReason: "Your verified match",
    viewerIds: [VIEWER_ID],
    crewIds: [],
  },
  {
    id: "activity-rank-prismo-rise",
    domain: "rankings",
    verb: "rank_moved",
    title: "You climbed four weekly positions",
    description: "Your Lagos EA FC rank moved from #27 to #23 after the latest verified results.",
    actor: {
      id: "platform-leaderboards",
      kind: "platform",
      name: "VERZUS Rankings",
      handle: null,
      initials: "VR",
      artworkUrl: null,
      verified: true,
    },
    occurredAt: minutesAgo(28),
    href: "/leaderboards/weekly",
    actionLabel: "View standings",
    contextLabel: "Lagos · Week 14",
    metric: "#23",
    tone: "cyan",
    visibility: "private",
    personalizationReason: "Your ranking movement",
    viewerIds: [VIEWER_ID],
    crewIds: [],
  },
  {
    id: "activity-crew-roster-locked",
    domain: "crews",
    verb: "crew_roster_locked",
    title: "Xenon locked its War Day roster",
    description: "Your Crew confirmed the EA FC lane for Saturday against Apex Predators.",
    actor: {
      id: "crew-xenon-esports",
      kind: "crew",
      name: "Xenon Esports",
      handle: "XEN",
      initials: "XE",
      artworkUrl: null,
      verified: true,
    },
    occurredAt: hoursAgo(1),
    href: "/crews/crew-xenon-esports",
    actionLabel: "View roster",
    contextLabel: "Crew War · Saturday",
    metric: "EA FC lane",
    tone: "magenta",
    visibility: "crew",
    personalizationReason: "Your Crew",
    viewerIds: [],
    crewIds: ["crew-xenon-esports"],
  },
  {
    id: "activity-reward-ready",
    domain: "rewards",
    verb: "reward_funded",
    title: "Week 14 reward is funded",
    description: "Your verified participation reward is available in the Rewards centre.",
    actor: {
      id: "platform-rewards",
      kind: "platform",
      name: "VERZUS Rewards",
      handle: null,
      initials: "RW",
      artworkUrl: null,
      verified: true,
    },
    occurredAt: hoursAgo(2),
    href: "/rewards",
    actionLabel: "Review reward",
    contextLabel: "Weekly participation",
    metric: "2,500 VS",
    tone: "gold",
    visibility: "private",
    personalizationReason: "Your reward",
    viewerIds: [VIEWER_ID],
    crewIds: [],
  },
  {
    id: "activity-followed-player-final",
    domain: "matches",
    verb: "followed_player_result",
    title: "RivalKing closed a five-goal match",
    description: "A followed player completed a high-scoring COD Mobile exhibition against Nova Prime.",
    actor: {
      id: "player-rivalking",
      kind: "player",
      name: "RivalKing",
      handle: "@rivalking",
      initials: "RK",
      artworkUrl: null,
      verified: true,
    },
    occurredAt: hoursAgo(4),
    href: "/players/player-rivalking",
    actionLabel: "View player",
    contextLabel: "Followed player",
    metric: "5-3",
    tone: "violet",
    visibility: "public",
    personalizationReason: "You follow RivalKing",
    viewerIds: [],
    crewIds: [],
  },
  {
    id: "activity-competition-entry",
    domain: "competitions",
    verb: "competition_entry_confirmed",
    title: "Your Rookie Cup entry is confirmed",
    description: "Eligibility, roster and registration checks passed for Saturday's EA FC bracket.",
    actor: {
      id: "platform-competitions",
      kind: "platform",
      name: "Competition Operations",
      handle: null,
      initials: "CO",
      artworkUrl: null,
      verified: true,
    },
    occurredAt: hoursAgo(7),
    href: "/compete/competition-ea-fc-rookie-cup",
    actionLabel: "Open competition",
    contextLabel: "EA FC Rookie Cup",
    metric: "Entry confirmed",
    tone: "green",
    visibility: "private",
    personalizationReason: "Your competition entry",
    viewerIds: [VIEWER_ID],
    crewIds: [],
  },
  {
    id: "activity-mainland-streak",
    domain: "crews",
    verb: "followed_crew_streak",
    title: "Mainland Titans extended their streak",
    description: "The followed Crew won its third straight War Week fixture and moved into second place.",
    actor: {
      id: "crew-mainland-titans",
      kind: "crew",
      name: "Mainland Titans",
      handle: "MTN",
      initials: "MT",
      artworkUrl: null,
      verified: true,
    },
    occurredAt: daysAgo(1),
    href: "/crews/crew-mainland-titans",
    actionLabel: "View Crew",
    contextLabel: "Followed Crew · War Week",
    metric: "3 wins",
    tone: "magenta",
    visibility: "public",
    personalizationReason: "You follow Mainland Titans",
    viewerIds: [],
    crewIds: [],
  },
  {
    id: "activity-profile-badge",
    domain: "profile",
    verb: "profile_badge_awarded",
    title: "Verified competitor badge added",
    description: "Your public player card now shows the verified competitor identity badge.",
    actor: {
      id: "platform-identity",
      kind: "platform",
      name: "Identity Service",
      handle: null,
      initials: "ID",
      artworkUrl: null,
      verified: true,
    },
    occurredAt: daysAgo(1),
    href: "/profile",
    actionLabel: "View profile",
    contextLabel: "Player identity",
    metric: "Verified",
    tone: "cyan",
    visibility: "private",
    personalizationReason: "Your profile",
    viewerIds: [VIEWER_ID],
    crewIds: [],
  },
  {
    id: "activity-jayflex-qualification",
    domain: "competitions",
    verb: "followed_player_qualified",
    title: "JAYFLEX qualified for Ranked Open",
    description: "A followed player secured a top-16 seed for the next verified bracket.",
    actor: {
      id: "player-jayflex",
      kind: "player",
      name: "JAYFLEX_THE_UNBREAKABLE_CHAMPION",
      handle: "@jayflex",
      initials: "JF",
      artworkUrl: null,
      verified: true,
    },
    occurredAt: daysAgo(2),
    href: "/players/player-jayflex",
    actionLabel: "View player",
    contextLabel: "Followed player · Ranked Open",
    metric: "Seed #14",
    tone: "violet",
    visibility: "public",
    personalizationReason: "You follow JAYFLEX",
    viewerIds: [],
    crewIds: [],
  },
  {
    id: "activity-crew-application",
    domain: "crews",
    verb: "crew_application_received",
    title: "Xenon received a new application",
    description: "A verified EA FC player applied to join your Crew's competitive roster.",
    actor: {
      id: "crew-xenon-esports",
      kind: "crew",
      name: "Xenon Esports",
      handle: "XEN",
      initials: "XE",
      artworkUrl: null,
      verified: true,
    },
    occurredAt: daysAgo(2),
    href: "/crews/crew-xenon-esports?view=applications",
    actionLabel: "Review applications",
    contextLabel: "Crew membership",
    metric: "1 pending",
    tone: "magenta",
    visibility: "crew",
    personalizationReason: "Your Crew",
    viewerIds: [],
    crewIds: ["crew-xenon-esports"],
  },
  {
    id: "activity-public-unrelated",
    domain: "rankings",
    verb: "global_rank_change",
    title: "Apex Predators moved to first",
    description: "The global Crew table changed after the latest cross-game results.",
    actor: {
      id: "crew-apex-predators",
      kind: "crew",
      name: "Apex Predators",
      handle: "APX",
      initials: "AP",
      artworkUrl: null,
      verified: true,
    },
    occurredAt: daysAgo(3),
    href: "/leaderboards/weekly",
    actionLabel: "View standings",
    contextLabel: "Global Crew rankings",
    metric: "#1",
    tone: "gold",
    visibility: "public",
    personalizationReason: "Relevant to your Crew's table",
    viewerIds: [],
    crewIds: [],
  },
  {
    id: "activity-private-other-user",
    domain: "rewards",
    verb: "reward_funded",
    title: "Another player's private reward",
    description: "This record proves server-side viewer filtering and must never reach Prismo's response.",
    actor: {
      id: "player-private-other",
      kind: "player",
      name: "Private Player",
      handle: "@private",
      initials: "PP",
      artworkUrl: null,
      verified: false,
    },
    occurredAt: minutesAgo(1),
    href: "/rewards",
    actionLabel: "Review reward",
    contextLabel: "Private",
    metric: "Hidden",
    tone: "gold",
    visibility: "private",
    personalizationReason: "Not visible to this viewer",
    viewerIds: ["player-someone-else"],
    crewIds: [],
  },
];

const allowedDomains: readonly ActivityFeedDomain[] = [
  "all",
  "matches",
  "competitions",
  "crews",
  "rewards",
  "rankings",
  "profile",
];

const allowedScenarios: readonly ActivityFeedScenario[] = [
  "normal",
  "empty",
  "slow",
  "error",
  "offline",
  "malformed",
  "stale",
  "unauthorized",
  "forbidden",
  "not-found",
  "maintenance",
  "partial",
];

function isVisibleToViewer(record: StoredActivityItem): boolean {
  if (record.visibility === "private") return record.viewerIds.includes(VIEWER_ID);
  if (record.visibility === "crew") return record.crewIds.some((id) => VIEWER_CREW_IDS.has(id));
  return (
    record.actor.id === VIEWER_ID ||
    FOLLOWED_ACTOR_IDS.has(record.actor.id) ||
    record.personalizationReason.includes("your Crew's table")
  );
}

function compareActivity(left: StoredActivityItem, right: StoredActivityItem): number {
  const timeDifference = Date.parse(right.occurredAt) - Date.parse(left.occurredAt);
  return timeDifference !== 0 ? timeDifference : left.id.localeCompare(right.id);
}

function encodeCursor(offset: number): string {
  return Buffer.from(`activity:${offset}`, "utf8").toString("base64url");
}

function decodeCursor(cursor: string | null): number {
  if (!cursor) return 0;
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const match = /^activity:(\d+)$/.exec(decoded);
    if (!match) return -1;
    return Number(match[1]);
  } catch {
    return -1;
  }
}

export function normalizeActivityDomain(value: string | null): ActivityFeedDomain {
  return allowedDomains.includes(value as ActivityFeedDomain)
    ? (value as ActivityFeedDomain)
    : "all";
}

export function normalizeActivityScenario(value: string | null): ActivityFeedScenario {
  return allowedScenarios.includes(value as ActivityFeedScenario)
    ? (value as ActivityFeedScenario)
    : "normal";
}

export function normalizeActivityPageSize(value: string | null): number {
  const parsed = Number(value ?? "6");
  if (!Number.isInteger(parsed)) return 6;
  return Math.min(12, Math.max(3, parsed));
}

export function queryActivityFeed(input: {
  domain: ActivityFeedDomain;
  cursor: string | null;
  pageSize: number;
  scenario: ActivityFeedScenario;
}) {
  const offset = decodeCursor(input.cursor);
  if (offset < 0) {
    return {
      ok: false as const,
      status: 400,
      code: "ACTIVITY_CURSOR_INVALID",
      message: "The activity cursor is invalid or expired.",
      retryable: false,
    };
  }

  const visible = activityRecords
    .filter(isVisibleToViewer)
    .filter((record) => input.domain === "all" || record.domain === input.domain)
    .sort(compareActivity);

  const records = input.scenario === "empty" ? [] : visible;
  const items = records.slice(offset, offset + input.pageSize);
  const nextOffset = offset + items.length;
  const hasNextPage = nextOffset < records.length;

  return {
    ok: true as const,
    items,
    totalVisible: records.length,
    nextCursor: hasNextPage ? encodeCursor(nextOffset) : null,
    hasNextPage,
  };
}

export function serializeActivityItem(item: ActivityFeedItem) {
  return {
    id: item.id,
    domain: item.domain as ActivityFeedItemDomain,
    verb: item.verb,
    title: item.title,
    description: item.description,
    actor: {
      id: item.actor.id,
      kind: item.actor.kind,
      name: item.actor.name,
      handle: item.actor.handle,
      initials: item.actor.initials,
      artwork_url: item.actor.artworkUrl,
      verified: item.actor.verified,
    },
    occurred_at: item.occurredAt,
    href: item.href,
    action_label: item.actionLabel,
    context_label: item.contextLabel,
    metric: item.metric,
    tone: item.tone,
    visibility: item.visibility as ActivityVisibility,
    personalization_reason: item.personalizationReason,
  };
}
