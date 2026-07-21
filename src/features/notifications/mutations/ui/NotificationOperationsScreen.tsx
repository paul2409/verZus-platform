// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.4 IDEMPOTENT NOTIFICATION OPERATIONS

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ResourceStatePanel } from "@/components/feedback/resource-state";

import { notificationCenterQueryOptions } from "../../center/api/notification-center.query";
import type {
  NotificationCategory,
  NotificationLifecycleState,
  NotificationRecord,
  NotificationScenario,
} from "../../center/model/notification-center.types";
import { NotificationMutationError } from "../adapter/notification-mutation.adapter";
import { useNotificationMutations } from "../hooks/useNotificationMutations";
import type {
  NotificationMutationOperation,
  NotificationMutationScenario,
} from "../model/notification-mutation.types";
import { describeNotificationFailure } from "../../reliability/notification-reliability";
import styles from "./NotificationOperationsScreen.module.css";

const lifecycleFilters: Array<{ id: NotificationLifecycleState | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
  { id: "actioned", label: "Actioned" },
  { id: "dismissed", label: "Dismissed" },
  { id: "expired", label: "Expired" },
];

const categoryFilters: Array<{ id: NotificationCategory | "all"; label: string }> = [
  { id: "all", label: "All types" },
  { id: "match", label: "Matches" },
  { id: "crew", label: "Crews" },
  { id: "competition", label: "Competition" },
  { id: "reward", label: "Rewards" },
  { id: "security", label: "Security" },
  { id: "system", label: "System" },
];

const lifecycleSet = new Set(lifecycleFilters.map((item) => item.id));
const categorySet = new Set(categoryFilters.map((item) => item.id));
const readScenarioSet = new Set<NotificationScenario>([
  "normal",
  "stale",
  "empty",
  "error",
  "offline",
  "slow",
  "malformed",
  "unauthorized",
  "maintenance",
  "forbidden",
  "not-found",
]);
const mutationScenarioSet = new Set<NotificationMutationScenario>([
  "normal",
  "slow",
  "error",
  "offline",
  "malformed",
  "unauthorized",
  "forbidden",
  "maintenance",
  "conflict",
  "not-found",
]);

function readLifecycle(value: string | null): NotificationLifecycleState | "all" {
  return lifecycleSet.has(value as NotificationLifecycleState | "all")
    ? (value as NotificationLifecycleState | "all")
    : "all";
}

function readCategory(value: string | null): NotificationCategory | "all" {
  return categorySet.has(value as NotificationCategory | "all")
    ? (value as NotificationCategory | "all")
    : "all";
}

function readScenario(value: string | null): NotificationScenario {
  return readScenarioSet.has(value as NotificationScenario)
    ? (value as NotificationScenario)
    : "normal";
}

function readMutationScenario(value: string | null): NotificationMutationScenario {
  return mutationScenarioSet.has(value as NotificationMutationScenario)
    ? (value as NotificationMutationScenario)
    : "normal";
}

function readPage(value: string | null): number {
  const parsed = Number(value ?? "1");
  return Number.isFinite(parsed) ? Math.max(1, Math.trunc(parsed)) : 1;
}

function createHref(input: {
  state: NotificationLifecycleState | "all";
  category: NotificationCategory | "all";
  page?: number;
  scenario: NotificationScenario;
  mutationScenario: NotificationMutationScenario;
}): string {
  const params = new URLSearchParams();
  if (input.state !== "all") params.set("state", input.state);
  if (input.category !== "all") params.set("category", input.category);
  if ((input.page ?? 1) > 1) params.set("page", String(input.page));
  if (input.scenario !== "normal") params.set("scenario", input.scenario);
  if (input.mutationScenario !== "normal") {
    params.set("mutationScenario", input.mutationScenario);
  }
  const query = params.toString();
  return query ? `/notifications?${query}` : "/notifications";
}

function idempotencyKey(scope: string): string {
  return `m12-4-${scope}-${crypto.randomUUID()}`;
}

const notificationReferenceTime = new Date("2026-07-21T12:00:00.000Z").getTime();

function relativeTime(value: string): string {
  const age = Math.max(0, notificationReferenceTime - new Date(value).getTime());
  const minutes = Math.floor(age / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function groupLabel(value: string): "Today" | "Yesterday" | "Earlier" {
  const age = Math.max(0, notificationReferenceTime - new Date(value).getTime());
  if (age < 86_400_000) return "Today";
  if (age < 2 * 86_400_000) return "Yesterday";
  return "Earlier";
}

function ResourceError({ error, retry }: { error: Error | null; retry: () => void }) {
  const descriptor = describeNotificationFailure(error);
  return (
    <ResourceStatePanel
      descriptor={descriptor}
      onRetry={retry}
      retryLabel="Retry notification feed"
      secondaryHref={descriptor.state === "unauthorized" ? "/login" : "/search"}
      secondaryLabel={descriptor.state === "unauthorized" ? "Sign in" : "Open Search"}
    />
  );
}

function MutationFeedback({
  error,
  retry,
  reset,
  retryable,
}: {
  error: Error;
  retry: () => void;
  reset: () => void;
  retryable: boolean;
}) {
  const known = error instanceof NotificationMutationError ? error : null;
  return (
    <section className={styles.mutationError} role="alert">
      <div>
        <p className={styles.eyebrow}>Update not confirmed</p>
        <strong>{known?.message ?? error.message}</strong>
        {known?.requestId ? <code>{known.requestId}</code> : null}
      </div>
      <div className={styles.feedbackActions}>
        {retryable ? <button onClick={retry} type="button">Retry same request</button> : null}
        <button onClick={reset} type="button">Dismiss message</button>
      </div>
    </section>
  );
}

function NotificationCard({
  item,
  pending,
  onOperation,
}: {
  item: NotificationRecord;
  pending: boolean;
  onOperation: (
    item: NotificationRecord,
    operation: NotificationMutationOperation,
    navigateAfterSuccess: boolean,
  ) => void;
}) {
  const terminal = item.state === "actioned" || item.state === "dismissed" || item.state === "expired";

  return (
    <article className={styles.notificationCard} data-priority={item.priority} data-state={item.state}>
      <div className={styles.cardTopline}>
        <div className={styles.statusRow}>
          <span className={styles.stateBadge} data-state={item.state}>{item.state}</span>
          <span className={styles.categoryBadge}>{item.category}</span>
        </div>
        <time dateTime={item.createdAt}>{relativeTime(item.createdAt)}</time>
      </div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <dl className={styles.cardMeta}>
        <div><dt>Source</dt><dd>{item.sourceLabel}</dd></div>
        <div><dt>Reference</dt><dd>{item.reference}</dd></div>
      </dl>
      <div className={styles.cardActions} aria-busy={pending}>
        {item.state === "unread" ? (
          <button disabled={pending} onClick={() => onOperation(item, "read", false)} type="button">
            {pending ? "Updating…" : "Mark read"}
          </button>
        ) : null}
        {!terminal ? (
          <button disabled={pending} onClick={() => onOperation(item, "dismissed", false)} type="button">
            Dismiss
          </button>
        ) : null}
        {!terminal && item.href ? (
          <button
            className={styles.primaryAction}
            disabled={pending}
            onClick={() => onOperation(item, "actioned", true)}
            type="button"
          >
            {item.actionLabel ?? "Open and action"}
          </button>
        ) : item.href ? (
          <Link className={styles.destinationLink} href={item.href}>View destination</Link>
        ) : null}
      </div>
    </article>
  );
}

function NotificationOperationsExperience(props: {
  state: NotificationLifecycleState | "all";
  category: NotificationCategory | "all";
  page: number;
  scenario: NotificationScenario;
  mutationScenario: NotificationMutationScenario;
}) {
  const router = useRouter();
  const resource = useQuery(
    notificationCenterQueryOptions({
      state: props.state,
      category: props.category,
      page: props.page,
      pageSize: 6,
      scenario: props.scenario,
    }),
  );
  const operations = useNotificationMutations();

  const groups = useMemo(() => {
    const output = new Map<string, NotificationRecord[]>();
    for (const item of resource.data?.items ?? []) {
      const label = groupLabel(item.createdAt);
      output.set(label, [...(output.get(label) ?? []), item]);
    }
    return [...output.entries()];
  }, [resource.data?.items]);

  const runOperation = async (
    item: NotificationRecord,
    operation: NotificationMutationOperation,
    navigateAfterSuccess: boolean,
  ) => {
    try {
      await operations.submit({
        kind: "single",
        notificationId: item.id,
        operation,
        expectedState: item.state,
        idempotencyKey: idempotencyKey(`${item.id}-${operation}`),
        scenario: props.mutationScenario,
      });
      if (navigateAfterSuccess && item.href) router.push(item.href);
    } catch {
      // The local mutation recovery panel owns failure presentation.
    }
  };

  const markAllRead = async () => {
    try {
      await operations.submit({
        kind: "read-all",
        category: "all",
        idempotencyKey: idempotencyKey("read-all"),
        scenario: props.mutationScenario,
      });
    } catch {
      // The local mutation recovery panel owns failure presentation.
    }
  };

  const retryMutation = async () => {
    try {
      await operations.retry();
    } catch {
      // Keep the recovery panel visible with the latest request error.
    }
  };

  const unreadCount = resource.data?.meta.unreadCount ?? 0;

  return (
    <main className={styles.page} data-m12-reliability="12.6" data-m12-stage="12.4">
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>12.4 // Notification operations</p>
          <h1>Signal centre</h1>
          <p className={styles.heroCopy}>
            Review competitive events, confirm outcomes and remove low-value interrupts without losing shell access.
          </p>
          <Link className={styles.settingsLink} href="/notifications/settings">
            Notification settings
          </Link>
        </div>
        <section className={styles.unreadPanel} aria-label={`${unreadCount} unread notifications`}>
          <span>Unread</span>
          <strong>{unreadCount}</strong>
          <button
            disabled={unreadCount === 0 || operations.isPending}
            onClick={() => void markAllRead()}
            type="button"
          >
            {operations.activeInput?.kind === "read-all" && operations.isPending
              ? "Confirming…"
              : "Mark all read"}
          </button>
        </section>
      </header>

      <section className={styles.toolbar} aria-label="Notification filters">
        <nav aria-label="Notification lifecycle" className={styles.filterRow}>
          {lifecycleFilters.map((filter) => (
            <Link
              aria-current={filter.id === props.state ? "page" : undefined}
              href={createHref({ ...props, state: filter.id, page: 1 })}
              key={filter.id}
            >
              {filter.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Notification categories" className={styles.filterRow}>
          {categoryFilters.map((filter) => (
            <Link
              aria-current={filter.id === props.category ? "page" : undefined}
              href={createHref({ ...props, category: filter.id, page: 1 })}
              key={filter.id}
            >
              {filter.label}
            </Link>
          ))}
        </nav>
      </section>

      {operations.error ? (
        <MutationFeedback
          error={operations.error}
          reset={operations.reset}
          retry={() => void retryMutation()}
          retryable={
            operations.error instanceof NotificationMutationError
              ? operations.error.retryable
              : true
          }
        />
      ) : null}

      {operations.data ? (
        <section className={styles.mutationSuccess} role="status">
          <strong>{operations.data.replayed ? "Replay confirmed" : "Update confirmed"}</strong>
          <span>
            {operations.data.updatedCount} record{operations.data.updatedCount === 1 ? "" : "s"} changed · {operations.data.unreadCount} unread
          </span>
        </section>
      ) : null}

      {resource.isPending ? (
        <section aria-busy="true" className={styles.loadingList}>
          <span>Loading notification operations…</span>
          {Array.from({ length: 4 }, (_, index) => <div key={index} />)}
        </section>
      ) : resource.isError ? (
        <ResourceError error={resource.error} retry={() => void resource.refetch()} />
      ) : !resource.data?.items.length ? (
        <section className={styles.emptyState}>
          <p className={styles.eyebrow}>Queue clear</p>
          <h2>No notifications match these filters</h2>
          <p>Change the lifecycle or category filter to inspect another signal group.</p>
          <Link href="/notifications">Reset filters</Link>
        </section>
      ) : (
        <div className={styles.contentGrid}>
          <section className={styles.feed} aria-label="Notification results">
            {resource.isFetching ? <p className={styles.refreshNote}>Refreshing confirmed notifications…</p> : null}
            {resource.data.meta.freshness === "stale" ? (
              <p className={styles.staleNote}>Showing retained notification data while a fresh response is requested.</p>
            ) : null}
            {groups.map(([label, items]) => (
              <section className={styles.group} key={label}>
                <div className={styles.groupHeader}>
                  <h2>{label}</h2>
                  <span>{items.length} signal{items.length === 1 ? "" : "s"}</span>
                </div>
                <div className={styles.cardList}>
                  {items.map((item) => (
                    <NotificationCard
                      item={item}
                      key={item.id}
                      onOperation={(record, operation, navigate) =>
                        void runOperation(record, operation, navigate)
                      }
                      pending={operations.isPending}
                    />
                  ))}
                </div>
              </section>
            ))}

            {(resource.data.meta.totalPages ?? 0) > 1 ? (
              <nav aria-label="Notification pages" className={styles.pagination}>
                <Link
                  aria-disabled={props.page <= 1}
                  href={createHref({ ...props, page: Math.max(1, props.page - 1) })}
                  tabIndex={props.page <= 1 ? -1 : undefined}
                >
                  Previous
                </Link>
                <span>Page {resource.data.meta.page} of {resource.data.meta.totalPages}</span>
                <Link
                  aria-disabled={props.page >= resource.data.meta.totalPages}
                  href={createHref({
                    ...props,
                    page: Math.min(resource.data.meta.totalPages, props.page + 1),
                  })}
                  tabIndex={props.page >= resource.data.meta.totalPages ? -1 : undefined}
                >
                  Next
                </Link>
              </nav>
            ) : null}
          </section>

          <aside className={styles.sideRail}>
            <section>
              <p className={styles.eyebrow}>Mutation contract</p>
              <h2>Replay safe</h2>
              <p>Retries reuse the original idempotency key. Conflicting state changes are rejected and revalidated.</p>
            </section>
            <section>
              <p className={styles.eyebrow}>Shell bridge</p>
              <h2>One unread count</h2>
              <p>The notification domain owns the badge resource. The application shell only receives the confirmed number.</p>
            </section>
            {resource.data.meta.requestId ? (
              <section className={styles.requestCard}>
                <span>Read request</span>
                <code>{resource.data.meta.requestId}</code>
              </section>
            ) : null}
          </aside>
        </div>
      )}

      <footer className={styles.stageNote}>
        <strong>M12.4 notification mutations</strong>
        <span>Read, action, dismiss and unread-badge synchronization are server-authoritative and independently recoverable.</span>
      </footer>
    </main>
  );
}

export function NotificationOperationsScreen() {
  const searchParams = useSearchParams();
  const state = readLifecycle(searchParams.get("state"));
  const category = readCategory(searchParams.get("category"));
  const page = readPage(searchParams.get("page"));
  const scenario = readScenario(searchParams.get("scenario"));
  const mutationScenario = readMutationScenario(searchParams.get("mutationScenario"));

  return (
    <NotificationOperationsExperience
      category={category}
      key={`${state}:${category}:${page}:${scenario}:${mutationScenario}`}
      mutationScenario={mutationScenario}
      page={page}
      scenario={scenario}
      state={state}
    />
  );
}
