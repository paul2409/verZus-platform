"use client";

import Link from "next/link";

import type { CrewSummary } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayEmptyState } from "./PlayEmptyState";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

export function CrewPulseWidget({
  view,
  onRetry,
}: {
  view: PlayWidgetView<CrewSummary>;
  onRetry: () => void;
}) {
  const unresolved = !view.data && view.state !== "empty" && view.state !== "success";

  return (
    <WidgetFrame
      title="ONLINE CREW"
      status={view.data ? `${view.data.onlineMembers} ONLINE` : "NO CREW"}
      className={styles.crewWidget}
    >
      {unresolved ? (
        <PlayWidgetStatePanel
          state={view.state}
          errorCode={view.errorCode}
          requestId={view.requestId}
          onRetry={onRetry}
        />
      ) : !view.data ? (
        <PlayEmptyState
          compact
          variant="crew"
          title="COMPETE WITH A UNIT BEHIND YOU"
          detail="Join or create a Crew to unlock shared fixtures, rankings, and live team operations."
          primaryAction={{ href: "/crews", label: "EXPLORE CREWS" }}
          secondaryAction={{ href: "/crews/create", label: "CREATE CREW" }}
        >
          <div className={styles.emptyCrewBenefits}>
            <span><b>01</b><strong>Shared ranking</strong></span>
            <span><b>02</b><strong>Crew fixtures</strong></span>
            <span><b>03</b><strong>Member activity</strong></span>
          </div>
        </PlayEmptyState>
      ) : (
        <>
          <div className={styles.crewRosterSummary}>
            <span className={styles.crewBadge} aria-hidden="true">{view.data.tag}</span>
            <div>
              <strong>{view.data.name}</strong>
              <small>{view.data.rank > 0 ? `Rank #${view.data.rank}` : "Unranked"} · {view.data.points} points</small>
            </div>
            <i aria-label={`${view.data.onlineMembers} members online`} />
          </div>
          <div className={styles.crewSignalRows}>
            <div><span>ONLINE MEMBERS</span><strong>{view.data.onlineMembers}/{view.data.totalMembers}</strong></div>
            <div><span>LIVE ACTIVITY</span><strong>{view.data.liveActivityCount}</strong></div>
            <div><span>NEXT FIXTURE</span><strong>{view.data.nextFixtureLabel ?? "Schedule pending"}</strong></div>
          </div>
          <Link className={styles.fullWidthLink} href={`/crews/${view.data.crewId}`}>OPEN CREW HQ</Link>
        </>
      )}
    </WidgetFrame>
  );
}
