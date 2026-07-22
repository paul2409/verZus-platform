import type {
  ActivityFeedDomain,
  ActivityFeedItem,
} from "../model/activity-feed.types";
import { readViewerActivity } from "./activity-feed.repository";

const allowedDomains: readonly ActivityFeedDomain[] = [
  "all",
  "matches",
  "competitions",
  "crews",
  "rewards",
  "rankings",
  "profile",
];

function encodeCursor(offset: number): string {
  return Buffer.from(`activity:${offset}`, "utf8").toString("base64url");
}

function decodeCursor(cursor: string | null): number {
  if (!cursor) return 0;
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const match = /^activity:(\d+)$/.exec(decoded);
    return match ? Number(match[1]) : -1;
  } catch {
    return -1;
  }
}

export function normalizeActivityDomain(value: string | null): ActivityFeedDomain {
  return allowedDomains.includes(value as ActivityFeedDomain)
    ? (value as ActivityFeedDomain)
    : "all";
}

export function normalizeActivityPageSize(value: string | null): number {
  const parsed = Number(value ?? "6");
  if (!Number.isInteger(parsed)) return 6;
  return Math.min(12, Math.max(3, parsed));
}

export async function queryActivityFeed(input: {
  userId: string;
  domain: ActivityFeedDomain;
  cursor: string | null;
  pageSize: number;
}) {
  const offset = decodeCursor(input.cursor);
  if (offset < 0) {
    return {
      ok: false as const,
      status: 400,
      code: "ACTIVITY_CURSOR_INVALID",
      message: "The activity cursor is invalid.",
      retryable: false,
    };
  }

  const records = await readViewerActivity({ userId: input.userId, domain: input.domain });
  const items = records.slice(offset, offset + input.pageSize);
  const nextOffset = offset + items.length;
  const hasNextPage = nextOffset < records.length;

  return {
    ok: true as const,
    items,
    nextCursor: hasNextPage ? encodeCursor(nextOffset) : null,
    hasNextPage,
    totalVisible: records.length,
  };
}

export function serializeActivityItem(item: ActivityFeedItem) {
  return {
    id: item.id,
    domain: item.domain,
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
    visibility: item.visibility,
    personalization_reason: item.personalizationReason,
  };
}
