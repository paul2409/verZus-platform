// VERZUS STAGE 3 RECENT ACTIVITY
"use client";

import Link from "next/link";

import type { RecentActivityItem } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

function formatActivityTime(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function RecentActivityWidget({
  view,
  onRetry,
}: {
  view: PlayWidgetView<RecentActivityItem[]>;
  onRetry: () => void;
}) {
  return (
    <WidgetFrame
      eyebrow="05 · RECENT ACTIVITY"
      title="Latest movement"
      status={view.stale ? "REFRESHING" : "FEED"}
    >
      {!view.data || view.data.length === 0 ? (
        <PlayWidgetStatePanel
          state={view.state}
          errorCode={view.errorCode}
          requestId={view.requestId}
          onRetry={onRetry}
          emptyTitle="NO ACTIVITY YET"
          emptyDetail="Verified results, points, and Crew updates will appear here."
        />
      ) : (
        <>
          <div className={styles.activityList}>
            {view.data.map((activity) => (
              <article data-activity-type={activity.type} key={activity.activityId}>
                <span aria-hidden="true">›</span>
                <div>
                  <strong>{activity.title}</strong>
                  <small>
                    {activity.detail} · {formatActivityTime(activity.occurredAt)}
                  </small>
                </div>
                <b data-numeric>
                  {activity.pointsDelta === null
                    ? "—"
                    : `${activity.pointsDelta > 0 ? "+" : ""}${activity.pointsDelta}`}
                </b>
              </article>
            ))}
          </div>

          <Link className={styles.secondaryLink} href="/profile/matches">
            VIEW ALL ACTIVITY
          </Link>
        </>
      )}
    </WidgetFrame>
  );
}
