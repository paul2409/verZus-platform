// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.5 PERSONALIZED ACTIVITY FEED UI

"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ResourceStatePanel } from "@/components/feedback/resource-state";

import { activityFeedInfiniteQueryOptions } from "../api/activity-feed.query";
import type {
  ActivityFeedDomain,
  ActivityFeedItem,
  ActivityFeedScenario,
} from "../model/activity-feed.types";
import { describeActivityFailure } from "../../reliability/activity-reliability";
import styles from "./ActivityFeedScreen.module.css";

const domainOptions: readonly { id: ActivityFeedDomain; label: string }[] = [
  { id: "all", label: "For you" },
  { id: "matches", label: "Matches" },
  { id: "competitions", label: "Competitions" },
  { id: "crews", label: "Crews" },
  { id: "rewards", label: "Rewards" },
  { id: "rankings", label: "Rankings" },
  { id: "profile", label: "Profile" },
];

const validDomains = new Set<ActivityFeedDomain>(domainOptions.map((option) => option.id));
const validScenarios = new Set<ActivityFeedScenario>([
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
]);

function readDomain(value: string | null): ActivityFeedDomain {
  return value && validDomains.has(value as ActivityFeedDomain)
    ? (value as ActivityFeedDomain)
    : "all";
}

function readScenario(value: string | null): ActivityFeedScenario {
  return value && validScenarios.has(value as ActivityFeedScenario)
    ? (value as ActivityFeedScenario)
    : "normal";
}

function dateKey(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function dayLabel(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const yesterday = new Date(today.getTime() - 86_400_000).toISOString().slice(0, 10);
  const key = date.toISOString().slice(0, 10);
  if (key === todayKey) return "Today";
  if (key === yesterday) return "Yesterday";
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function timeLabel(value: string): string {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function groupedItems(items: readonly ActivityFeedItem[]) {
  const groups = new Map<string, ActivityFeedItem[]>();
  for (const item of items) {
    const key = dateKey(item.occurredAt);
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  }
  return Array.from(groups.entries()).map(([key, values]) => ({ key, items: values }));
}

function ActivityArtwork({ item }: { item: ActivityFeedItem }) {
  return (
    <span className={styles.avatar} data-tone={item.tone} title={item.actor.name}>
      <span aria-hidden="true">{item.actor.initials}</span>
      {item.actor.verified ? <span aria-label="Verified" className={styles.verified}>✓</span> : null}
    </span>
  );
}

function ActivityCard({ item }: { item: ActivityFeedItem }) {
  return (
    <article className={styles.card} data-domain={item.domain} data-tone={item.tone}>
      <ActivityArtwork item={item} />
      <div className={styles.cardBody}>
        <div className={styles.cardTopline}>
          <div className={styles.actorLine}>
            <strong title={item.actor.name}>{item.actor.name}</strong>
            {item.actor.handle ? <span>{item.actor.handle}</span> : null}
          </div>
          <time dateTime={item.occurredAt}>{timeLabel(item.occurredAt)}</time>
        </div>
        <p className={styles.reason}>{item.personalizationReason}</p>
        <h3>{item.title}</h3>
        <p className={styles.description}>{item.description}</p>
        <div className={styles.contextRow}>
          <span>{item.contextLabel}</span>
          {item.metric ? <strong>{item.metric}</strong> : null}
        </div>
        <Link className={styles.contextLink} href={item.href}>
          {item.actionLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

function ActivityFeedSkeleton() {
  return (
    <div aria-label="Loading personalized activity" className={styles.skeletonList} role="status">
      {[0, 1, 2, 3].map((item) => (
        <div className={styles.skeletonCard} key={item}>
          <span />
          <div><span /><span /><span /></div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ domain }: { domain: ActivityFeedDomain }) {
  const label = domainOptions.find((option) => option.id === domain)?.label ?? "activity";
  return (
    <section className={styles.emptyState}>
      <span aria-hidden="true" className={styles.emptyGlyph}>+</span>
      <p className={styles.eyebrow}>No activity yet</p>
      <h2>Nothing new in {label.toLowerCase()}</h2>
      <p>Verified matches, Crew movement, competition entries and rewards will appear here.</p>
      <Link className={styles.secondaryAction} href="/play">Return to Play</Link>
    </section>
  );
}

function ErrorState({ error, retrying, onRetry }: {
  error: Error;
  retrying: boolean;
  onRetry: () => void;
}) {
  const descriptor = describeActivityFailure(error);
  return (
    <ResourceStatePanel
      descriptor={descriptor}
      onRetry={retrying ? undefined : onRetry}
      retryLabel={retrying ? "Retrying..." : "Retry activity"}
      secondaryHref={descriptor.state === "unauthorized" ? "/login" : "/notifications"}
      secondaryLabel={descriptor.state === "unauthorized" ? "Sign in" : "Open notifications"}
    />
  );
}

export function ActivityFeedScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domain = readDomain(searchParams.get("domain"));
  const scenario = readScenario(searchParams.get("scenario"));
  const query = useInfiniteQuery(
    activityFeedInfiniteQueryOptions({ domain, pageSize: 6, scenario }),
  );

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const groups = useMemo(() => groupedItems(items), [items]);
  const totalVisible = query.data?.pages[0]?.meta.totalVisible ?? 0;

  function changeDomain(nextDomain: ActivityFeedDomain) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextDomain === "all") params.delete("domain");
    else params.set("domain", nextDomain);
    const queryString = params.toString();
    router.replace(queryString ? `/activity?${queryString}` : "/activity", { scroll: false });
  }

  const initialLoading = query.isPending && !query.data;
  const refreshing = query.isFetching && !query.isFetchingNextPage && Boolean(query.data);

  return (
    <main className={styles.page} data-activity-domain={domain} data-m12-reliability="12.6" data-m12-stage="12.5">
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>12.5 // PERSONALIZED SIGNALS</p>
          <h1>ACTIVITY FEED</h1>
          <p className={styles.heroCopy}>
            Verified movement from your matches, Crew, competitions, rankings and rewards.
          </p>
        </div>
        <div className={styles.heroStats} aria-label="Activity feed summary">
          <span><strong>{totalVisible}</strong> relevant signals</span>
          <span><strong>Viewer-safe</strong> server filtered</span>
          <span><strong>Cursor</strong> paginated</span>
        </div>
      </header>

      <section aria-label="Activity domains" className={styles.filterPanel}>
        <div>
          <p className={styles.filterLabel}>Filter your feed</p>
          <span>{refreshing ? "Refreshing confirmed activity..." : "Newest verified activity first"}</span>
        </div>
        <div className={styles.filterRail} role="list">
          {domainOptions.map((option) => (
            <button
              aria-pressed={domain === option.id}
              className={styles.filterButton}
              data-active={domain === option.id ? "true" : "false"}
              key={option.id}
              onClick={() => changeDomain(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <div className={styles.contentGrid}>
        <section aria-labelledby="activity-stream-title" className={styles.streamPanel}>
          <div className={styles.streamHeading}>
            <div>
              <p className={styles.eyebrow}>LIVE COMPETITIVE RECORD</p>
              <h2 id="activity-stream-title">
                {domainOptions.find((option) => option.id === domain)?.label ?? "For you"}
              </h2>
            </div>
            <Link href="/notifications">Notification centre</Link>
          </div>

          {initialLoading ? <ActivityFeedSkeleton /> : null}
          {query.isError && !query.data ? (
            <ErrorState error={query.error} onRetry={() => void query.refetch()} retrying={query.isFetching} />
          ) : null}
          {!initialLoading && !query.isError && items.length === 0 ? <EmptyState domain={domain} /> : null}

          {query.data?.pages[0]?.meta.freshness === "stale" ? (
            <div className={styles.paginationError} role="status">
              <span>Showing a stale confirmed Activity snapshot while a fresh version is unavailable.</span>
              <button onClick={() => void query.refetch()} type="button">Refresh activity</button>
            </div>
          ) : null}

          {groups.map((group) => (
            <section className={styles.dayGroup} key={group.key}>
              <div className={styles.dayHeading}>
                <h3>{dayLabel(group.items[0]!.occurredAt)}</h3>
                <span>{group.items.length} signals</span>
              </div>
              <div className={styles.activityList}>
                {group.items.map((item) => <ActivityCard item={item} key={item.id} />)}
              </div>
            </section>
          ))}

          {query.hasNextPage ? (
            <button
              className={styles.loadMore}
              disabled={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
              type="button"
            >
              {query.isFetchingNextPage ? "Loading next signals..." : "Load more activity"}
            </button>
          ) : items.length > 0 ? (
            <p className={styles.endState}>You are caught up on this feed.</p>
          ) : null}

          {query.isFetchNextPageError ? (
            <div className={styles.paginationError} role="alert">
              <span>Older activity could not load. Confirmed items remain visible.</span>
              <button onClick={() => void query.fetchNextPage()} type="button">Retry page</button>
            </div>
          ) : null}
        </section>

        <aside className={styles.sidePanel}>
          <section>
            <p className={styles.eyebrow}>WHY YOU SEE THIS</p>
            <h2>Personalized, not global noise</h2>
            <p>
              The server includes your records, your Crew and followed competitors before data reaches the browser.
            </p>
          </section>
          <section>
            <p className={styles.eyebrow}>RESOURCE BOUNDARY</p>
            <h2>Independent from Search and notifications</h2>
            <p>
              A failed activity request cannot remove navigation, notification actions or healthy Search results.
            </p>
          </section>
          <section>
            <p className={styles.eyebrow}>NEXT HARDENING</p>
            <h2>M12.7 observability</h2>
            <p>
              Reliability states are explicit. Privacy-safe telemetry and delivery resilience remain next.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
