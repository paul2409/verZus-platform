"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import type { ActionCentreItem } from "@/lib/actions";
import { actionCentreQueryOptions } from "@/shared/composition/action-centre";

import styles from "./action-centre-panel.module.css";

function deadlineLabel(deadlineAt: string | null): string | null {
  if (!deadlineAt) return null;
  const remaining = new Date(deadlineAt).getTime() - Date.now();
  if (remaining <= 0) return "Due now";
  const minutes = Math.ceil(remaining / 60_000);
  if (minutes < 60) return `Due in ${minutes}m`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return `Due in ${hours}h`;
  return `Due in ${Math.ceil(hours / 24)}d`;
}

function ActionRow({ action }: { action: ActionCentreItem }) {
  const deadline = deadlineLabel(action.deadlineAt);
  return (
    <Link className={styles.actionRow} data-tone={action.tone} href={action.href}>
      <span className={styles.priorityMark} aria-hidden="true" />
      <span className={styles.actionCopy}>
        <span className={styles.actionMeta}>
          <b>{action.priority}</b>
          <em>{deadline ?? action.reason}</em>
        </span>
        <strong>{action.label}</strong>
        <small>{action.detail}</small>
      </span>
      <span className={styles.actionCta}>{action.actionLabel} →</span>
    </Link>
  );
}

export function ActionCentrePanel() {
  const query = useQuery(actionCentreQueryOptions());
  const snapshot = query.data;

  return (
    <section className={styles.panel} data-state={query.status}>
      <header className={styles.header}>
        <div>
          <span>LIVE PRIORITIES</span>
          <h2>ACTION CENTRE</h2>
        </div>
        {snapshot ? (
          <div className={styles.counts} aria-label={`${snapshot.total} open actions`}>
            {snapshot.criticalCount > 0 ? <b>{snapshot.criticalCount} critical</b> : null}
            <span>{snapshot.total} open</span>
          </div>
        ) : null}
      </header>

      {query.isPending ? (
        <div className={styles.stateCard} aria-busy="true">
          <span className={styles.scanner} />
          <strong>Prioritizing your live state</strong>
          <small>Checking matches, Crew decisions, rewards and profile blockers.</small>
        </div>
      ) : query.isError ? (
        <div className={styles.stateCard} data-tone="error">
          <strong>Action centre unavailable</strong>
          <small>Your other Play modules remain usable.</small>
          <button type="button" onClick={() => void query.refetch()}>
            RETRY
          </button>
        </div>
      ) : snapshot && snapshot.items.length > 0 ? (
        <div className={styles.actionList}>
          {snapshot.items.slice(0, 4).map((action) => (
            <ActionRow action={action} key={action.id} />
          ))}
        </div>
      ) : (
        <div className={styles.stateCard} data-tone="clear">
          <span className={styles.clearMark} aria-hidden="true">✓</span>
          <strong>All clear</strong>
          <small>No match, Crew, reward or profile action needs your attention.</small>
          <Link href="/compete">EXPLORE COMPETITIONS →</Link>
        </div>
      )}
    </section>
  );
}
