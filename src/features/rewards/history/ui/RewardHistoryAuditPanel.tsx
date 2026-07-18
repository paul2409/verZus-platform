"use client";

// VERZUS M10.6 PAGINATED AUDITABLE REWARD HISTORY UI

import { useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";

import { Badge } from "@/components/primitives/badge";

import { RewardHistoryAuditError } from "../adapter/reward-history-audit.adapter";
import { rewardHistoryAuditQueryOptions } from "../api/reward-history-audit.query";
import type { RewardAuditAction } from "../model/reward-history-audit.types";
import styles from "./RewardHistoryAuditPanel.module.css";

function actionTone(action: RewardAuditAction): "positive" | "warning" | "negative" | "neutral" {
  if (action === "reward_claimed") return "positive";
  if (action === "reward_expired") return "warning";
  if (action === "reward_revoked") return "negative";
  return "neutral";
}

export function RewardHistoryAuditPanel({ page }: { page: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const history = useQuery(rewardHistoryAuditQueryOptions(page));

  const hrefForPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) next.delete("historyPage");
    else next.set("historyPage", String(nextPage));
    const query = next.toString();
    return `${pathname}${query ? `?${query}` : ""}#reward-audit-history`;
  };

  return (
    <section
      aria-labelledby="audit-history-title"
      className={styles.panel}
      id="reward-audit-history"
    >
      <div className={styles.heading}>
        <div>
          <p>Confirmed ledger</p>
          <h2 id="audit-history-title">Reward history</h2>
        </div>
        {history.data ? <span>{history.data.data.total} events</span> : null}
      </div>

      {history.isPending ? (
        <div className={styles.loading}>Loading confirmed reward history…</div>
      ) : null}

      {history.isError ? (
        <div className={styles.error} role="alert">
          <strong>Reward history unavailable</strong>
          <p>{history.error.message}</p>
          {history.error instanceof RewardHistoryAuditError ? (
            <small>Request {history.error.requestId}</small>
          ) : null}
          <button onClick={() => void history.refetch()} type="button">
            Retry history
          </button>
        </div>
      ) : null}

      {history.data ? (
        <>
          <ol className={styles.list}>
            {history.data.data.items.map((item) => (
              <li data-action={item.action} key={item.id}>
                <div className={styles.eventTopline}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.sourceLabel}</span>
                  </div>
                  <Badge tone={actionTone(item.action)} variant="soft">
                    {item.statusLabel}
                  </Badge>
                </div>
                <div className={styles.eventMeta}>
                  <span>{item.amountLabel}</span>
                  <time dateTime={item.occurredAt}>{item.occurredAtLabel}</time>
                </div>
                <details>
                  <summary>Audit details</summary>
                  <dl>
                    <div>
                      <dt>Event</dt>
                      <dd>{item.eventReference}</dd>
                    </div>
                    <div>
                      <dt>Actor</dt>
                      <dd>{item.actorLabel}</dd>
                    </div>
                    <div>
                      <dt>Claim</dt>
                      <dd>{item.claimReference ?? "Not applicable"}</dd>
                    </div>
                    <div>
                      <dt>Inventory version</dt>
                      <dd>{item.inventoryVersion ?? "Not recorded"}</dd>
                    </div>
                  </dl>
                  {item.reason ? <p>{item.reason}</p> : null}
                </details>
              </li>
            ))}
          </ol>

          <nav aria-label="Reward history pages" className={styles.pagination}>
            {history.data.data.page > 1 ? (
              <a href={hrefForPage(history.data.data.page - 1)}>Previous</a>
            ) : (
              <span aria-disabled="true">Previous</span>
            )}
            <strong>
              Page {history.data.data.page} of {history.data.data.totalPages}
            </strong>
            {history.data.data.page < history.data.data.totalPages ? (
              <a href={hrefForPage(history.data.data.page + 1)}>Next</a>
            ) : (
              <span aria-disabled="true">Next</span>
            )}
          </nav>
          <small className={styles.requestId}>Request {history.data.meta.requestId}</small>
        </>
      ) : null}
    </section>
  );
}
