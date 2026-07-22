"use client";

import Link from "next/link";

import type { RecentActivityItem } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayEmptyState } from "./PlayEmptyState";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

function formatActivityTime(value: string): string {
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.round((new Date(value).getTime() - Date.now()) / 3_600_000),
    "hour",
  );
}

export function RecentActivityWidget({
  view,
  onRetry,
}: {
  view: PlayWidgetView<RecentActivityItem[]>;
  onRetry: () => void;
}) {
  const unresolved =
    (!view.data || view.data.length === 0) &&
    view.state !== "empty" &&
    view.state !== "success";

  return (
    <WidgetFrame title="ACTIVITY FEED" status="ALL ACTIVITY" statusHref="/activity" className={styles.activityWidget}>
      {unresolved ? (
        <PlayWidgetStatePanel
          state={view.state}
          errorCode={view.errorCode}
          requestId={view.requestId}
          onRetry={onRetry}
        />
      ) : !view.data || view.data.length === 0 ? (
        <PlayEmptyState
          compact
          variant="activity"
          title="YOUR FEED IS READY FOR ITS FIRST MOMENT"
          detail="Confirmed matches, Crew moves, and claimed rewards will build your competitive timeline."
          primaryAction={{ href: "/compete", label: "START COMPETING" }}
        >
          <div className={styles.emptyActivityPreview} aria-hidden="true">
            <span><i>VS</i><b>MATCH RESULT</b><em>Waiting</em></span>
            <span><i>C</i><b>CREW UPDATE</b><em>Waiting</em></span>
            <span><i>V</i><b>REWARD CLAIM</b><em>Waiting</em></span>
          </div>
        </PlayEmptyState>
      ) : (
        <div className={styles.activityFeed}>
          {view.data.slice(0, 4).map((activity) => (
            <article data-type={activity.type} key={activity.activityId}>
              <span aria-hidden="true">{activity.type.startsWith("match_") ? "VS" : activity.type === "crew_update" ? "C" : "V"}</span>
              <div>
                <strong>{activity.title}</strong>
                <small>{activity.detail} · {formatActivityTime(activity.occurredAt)}</small>
              </div>
              <b>{activity.pointsDelta === null ? "INFO" : activity.pointsDelta > 0 ? "GAIN" : "RESULT"}</b>
            </article>
          ))}
          <Link className={styles.fullWidthLink} href="/activity">VIEW ALL ACTIVITY</Link>
        </div>
      )}
    </WidgetFrame>
  );
}
