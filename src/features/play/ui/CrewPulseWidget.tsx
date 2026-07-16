// VERZUS STAGE 3 CREW PULSE
"use client";

import Link from "next/link";

import type { CrewSummary } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function CrewPulseWidget({
  view,
  onRetry,
}: {
  view: PlayWidgetView<CrewSummary>;
  onRetry: () => void;
}) {
  return (
    <WidgetFrame
      eyebrow="06 · CREW SIGNAL"
      title="Crew status"
      status={view.data?.liveActivityCount ? `${view.data.liveActivityCount} LIVE` : "CREW"}
    >
      {!view.data ? (
        <>
          <PlayWidgetStatePanel
            state={view.state}
            errorCode={view.errorCode}
            requestId={view.requestId}
            onRetry={onRetry}
            emptyTitle="NO CREW YET"
            emptyDetail="Discover a Crew that matches your game, region, and availability."
          />
          {view.state === "empty" ? (
            <Link className={styles.secondaryLink} href="/crews">
              EXPLORE CREWS
            </Link>
          ) : null}
        </>
      ) : (
        <>
          <div className={styles.crewIdentity}>
            <span aria-hidden="true">{view.data.tag}</span>
            <div>
              <strong>{view.data.name}</strong>
              <small>
                Rank #{view.data.rank} · {formatNumber(view.data.points)} points
              </small>
            </div>
          </div>

          <dl className={styles.crewMetrics}>
            <div>
              <dt>ONLINE</dt>
              <dd>
                {view.data.onlineMembers}/{view.data.totalMembers}
              </dd>
            </div>
            <div>
              <dt>LIVE ACTIVITY</dt>
              <dd>{view.data.liveActivityCount}</dd>
            </div>
          </dl>

          <div className={styles.crewFixture}>
            <span>NEXT CREW FIXTURE</span>
            <strong>{view.data.nextFixtureLabel ?? "Schedule pending"}</strong>
          </div>

          <Link className={styles.secondaryLink} href={`/crews/${view.data.crewId}`}>
            OPEN CREW HQ
          </Link>
        </>
      )}
    </WidgetFrame>
  );
}
