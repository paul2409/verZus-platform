// VERZUS M12.3 NOTIFICATION CENTER EXPERIENCE

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { Badge, type BadgeTone } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";

import { NotificationCenterError } from "../adapter/notification-center.adapter";
import { notificationCenterQueryOptions } from "../api/notification-center.query";
import type {
  NotificationCategory,
  NotificationLifecycleState,
  NotificationPriority,
  NotificationRecord,
  NotificationScenario,
} from "../model/notification-center.types";
import styles from "./NotificationCenterScreen.module.css";

const stateTabs: Array<{ id: NotificationLifecycleState | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
  { id: "actioned", label: "Actioned" },
  { id: "dismissed", label: "Dismissed" },
  { id: "expired", label: "Expired" },
];

const categoryTabs: Array<{ id: NotificationCategory | "all"; label: string }> = [
  { id: "all", label: "All types" },
  { id: "match", label: "Matches" },
  { id: "crew", label: "Crews" },
  { id: "competition", label: "Competition" },
  { id: "reward", label: "Rewards" },
  { id: "security", label: "Security" },
  { id: "system", label: "System" },
];

const stateSet = new Set(stateTabs.map((item) => item.id));
const categorySet = new Set(categoryTabs.map((item) => item.id));
const scenarioSet = new Set<NotificationScenario>([
  "normal",
  "stale",
  "empty",
  "error",
  "offline",
  "slow",
  "malformed",
  "unauthorized",
  "maintenance",
]);

function readState(value: string | null): NotificationLifecycleState | "all" {
  return stateSet.has(value as NotificationLifecycleState | "all")
    ? (value as NotificationLifecycleState | "all")
    : "all";
}

function readCategory(value: string | null): NotificationCategory | "all" {
  return categorySet.has(value as NotificationCategory | "all")
    ? (value as NotificationCategory | "all")
    : "all";
}

function readScenario(value: string | null): NotificationScenario {
  return scenarioSet.has(value as NotificationScenario) ? (value as NotificationScenario) : "normal";
}

function readPage(value: string | null): number {
  const page = Number(value ?? "1");
  return Number.isFinite(page) ? Math.max(1, Math.trunc(page)) : 1;
}

function createHref(input: {
  state: NotificationLifecycleState | "all";
  category: NotificationCategory | "all";
  page?: number;
  scenario?: NotificationScenario;
}): string {
  const params = new URLSearchParams();
  if (input.state !== "all") params.set("state", input.state);
  if (input.category !== "all") params.set("category", input.category);
  if ((input.page ?? 1) > 1) params.set("page", String(input.page));
  if (input.scenario && input.scenario !== "normal") params.set("scenario", input.scenario);
  const query = params.toString();
  return query ? `/notifications?${query}` : "/notifications";
}

function stateTone(state: NotificationLifecycleState): BadgeTone {
  const tones: Record<NotificationLifecycleState, BadgeTone> = {
    unread: "live",
    read: "neutral",
    actioned: "positive",
    dismissed: "warning",
    expired: "negative",
  };
  return tones[state];
}

function priorityLabel(priority: NotificationPriority): string {
  return priority === "critical" ? "Urgent" : priority === "high" ? "Priority" : priority;
}

function relativeTime(value: string): string {
  const difference = new Date("2026-07-20T16:30:00.000Z").getTime() - new Date(value).getTime();
  const minutes = Math.max(0, Math.round(difference / 60_000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function groupLabel(value: string): "Today" | "Yesterday" | "Earlier" {
  const age = new Date("2026-07-20T16:30:00.000Z").getTime() - new Date(value).getTime();
  if (age < 86_400_000) return "Today";
  if (age < 2 * 86_400_000) return "Yesterday";
  return "Earlier";
}

function categoryGlyph(category: NotificationCategory): string {
  const glyphs: Record<NotificationCategory, string> = {
    match: "VS",
    crew: "CR",
    competition: "CP",
    reward: "RW",
    security: "SC",
    system: "SY",
  };
  return glyphs[category];
}

function NotificationCard({ item }: { item: NotificationRecord }) {
  return (
    <article className={styles.notificationCard} data-priority={item.priority} data-state={item.state}>
      <div aria-hidden="true" className={styles.categoryIcon} data-category={item.category}>
        {categoryGlyph(item.category)}
      </div>
      <div className={styles.notificationBody}>
        <div className={styles.notificationTopline}>
          <div className={styles.badgeRow}>
            <Badge size="sm" tone={stateTone(item.state)}>{item.state}</Badge>
            <span className={styles.priorityLabel} data-priority={item.priority}>{priorityLabel(item.priority)}</span>
          </div>
          <time dateTime={item.createdAt}>{relativeTime(item.createdAt)}</time>
        </div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className={styles.notificationMeta}>
          <span>{item.sourceLabel}</span>
          <span>{item.reference}</span>
          {item.expiresAt ? <span>Expires {new Date(item.expiresAt).toLocaleDateString("en-GB")}</span> : null}
        </div>
        {item.href && item.actionLabel ? (
          <Link className={styles.notificationAction} href={item.href}>{item.actionLabel}<span aria-hidden="true">→</span></Link>
        ) : null}
      </div>
    </article>
  );
}

function ResourceError({ error, retry }: { error: Error | null; retry: () => void }) {
  const operational = error instanceof NotificationCenterError ? error : null;
  return (
    <section className={styles.errorState} role="alert">
      <span className={styles.errorCode}>SIGNAL INTERRUPTED</span>
      <h2>{operational?.message ?? "Notifications are temporarily unavailable."}</h2>
      <p>Search and the rest of VERZUS remain available. Retry only this notification resource.</p>
      {operational?.requestId ? <code>{operational.requestId}</code> : null}
      {operational?.retryable !== false ? <Button onClick={retry} size="sm">Retry notifications</Button> : null}
    </section>
  );
}

function NotificationCenterExperience(props: {
  state: NotificationLifecycleState | "all";
  category: NotificationCategory | "all";
  page: number;
  scenario: NotificationScenario;
}) {
  const resource = useQuery(notificationCenterQueryOptions({ ...props, pageSize: 6 }));
  const groups = useMemo(() => {
    const result: Record<"Today" | "Yesterday" | "Earlier", NotificationRecord[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };
    for (const item of resource.data?.items ?? []) result[groupLabel(item.createdAt)].push(item);
    return result;
  }, [resource.data?.items]);

  return (
    <main className={styles.page} data-m12-stage="12.3">
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>M12.3 // SIGNAL CENTRE</p>
          <h1>NOTIFICATIONS</h1>
          <p className={styles.heroCopy}>Match deadlines, Crew decisions, rewards, security and platform signals—ordered by urgency.</p>
        </div>
        <div className={styles.unreadCard}>
          <span>Unread signals</span>
          <strong>{resource.data?.meta.unreadCount ?? "—"}</strong>
          <small>Mutations and badge synchronization arrive in M12.4.</small>
        </div>
      </header>

      <nav aria-label="Notification state" className={styles.stateTabs}>
        {stateTabs.map((tab) => (
          <Link
            aria-current={props.state === tab.id ? "page" : undefined}
            className={styles.stateTab}
            href={createHref({ state: tab.id, category: props.category, scenario: props.scenario })}
            key={tab.id}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <section className={styles.toolbar} aria-label="Notification filters">
        <div className={styles.categoryTabs}>
          {categoryTabs.map((tab) => (
            <Link
              aria-current={props.category === tab.id ? "page" : undefined}
              className={styles.categoryTab}
              href={createHref({ state: props.state, category: tab.id, scenario: props.scenario })}
              key={tab.id}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <Link className={styles.settingsLink} href="/settings">Notification settings</Link>
      </section>

      {resource.isPending && !resource.data ? (
        <section aria-label="Loading notifications" className={styles.loadingList}>
          {Array.from({ length: 5 }, (_, index) => <div key={index} />)}
        </section>
      ) : resource.isError ? (
        <ResourceError error={resource.error} retry={() => void resource.refetch()} />
      ) : (
        <div className={styles.contentGrid}>
          <section aria-live="polite" className={styles.feed}>
            <div className={styles.feedHeader}>
              <div><p className={styles.eyebrow}>Operational feed</p><h2>{resource.data?.meta.total ?? 0} signals</h2></div>
              <div className={styles.freshness} data-state={resource.isFetching ? "retrying" : resource.data?.meta.freshness}>
                {resource.isFetching ? "Refreshing" : resource.data?.meta.freshness === "stale" ? "Stale snapshot" : "Live snapshot"}
              </div>
            </div>

            {(resource.data?.items.length ?? 0) === 0 ? (
              <div className={styles.emptyState}>
                <span aria-hidden="true">◎</span>
                <h2>No notifications in this view</h2>
                <p>Change the lifecycle or category filter to inspect another part of your signal history.</p>
                <Link href="/notifications">Reset filters</Link>
              </div>
            ) : (
              (["Today", "Yesterday", "Earlier"] as const).map((label) => groups[label].length ? (
                <section className={styles.group} key={label}>
                  <div className={styles.groupHeader}><h2>{label}</h2><span>{groups[label].length}</span></div>
                  <div className={styles.notificationList}>{groups[label].map((item) => <NotificationCard item={item} key={item.id} />)}</div>
                </section>
              ) : null)
            )}

            {(resource.data?.meta.totalPages ?? 0) > 1 ? (
              <nav aria-label="Notification pages" className={styles.pagination}>
                <Link
                  aria-disabled={props.page <= 1}
                  className={styles.pageLink}
                  href={createHref({ ...props, page: Math.max(1, props.page - 1) })}
                  tabIndex={props.page <= 1 ? -1 : undefined}
                >
                  Previous
                </Link>
                <span>Page {resource.data?.meta.page} of {resource.data?.meta.totalPages}</span>
                <Link
                  aria-disabled={props.page >= (resource.data?.meta.totalPages ?? 1)}
                  className={styles.pageLink}
                  href={createHref({ ...props, page: Math.min(resource.data?.meta.totalPages ?? 1, props.page + 1) })}
                  tabIndex={props.page >= (resource.data?.meta.totalPages ?? 1) ? -1 : undefined}
                >
                  Next
                </Link>
              </nav>
            ) : null}
          </section>

          <aside className={styles.sideRail}>
            <section className={styles.railCard}>
              <p className={styles.eyebrow}>Lifecycle</p>
              <h2>Signal states</h2>
              <dl>
                <div><dt>Unread</dt><dd>Needs review</dd></div>
                <div><dt>Read</dt><dd>Seen, no action</dd></div>
                <div><dt>Actioned</dt><dd>Completed outcome</dd></div>
                <div><dt>Dismissed</dt><dd>Intentionally hidden</dd></div>
                <div><dt>Expired</dt><dd>No longer actionable</dd></div>
              </dl>
            </section>
            <section className={styles.railCard}>
              <p className={styles.eyebrow}>Delivery policy</p>
              <h2>High-value interrupts only</h2>
              <p>Check-in, match-start and security alerts remain visually dominant. Informational records stay quieter.</p>
            </section>
            {resource.data?.meta.requestId ? <section className={styles.requestCard}><span>Request ID</span><code>{resource.data.meta.requestId}</code></section> : null}
          </aside>
        </div>
      )}

      <footer className={styles.stageNote}>
        <strong>M12.3 notification centre</strong>
        <span>Read-only lifecycle visibility is complete. Idempotent read, dismiss and action mutations follow in M12.4.</span>
      </footer>
    </main>
  );
}

export function NotificationCenterScreen() {
  const searchParams = useSearchParams();
  const state = readState(searchParams.get("state"));
  const category = readCategory(searchParams.get("category"));
  const page = readPage(searchParams.get("page"));
  const scenario = readScenario(searchParams.get("scenario"));
  return <NotificationCenterExperience category={category} key={`${state}:${category}:${page}:${scenario}`} page={page} scenario={scenario} state={state} />;
}
