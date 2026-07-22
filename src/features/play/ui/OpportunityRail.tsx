"use client";

import Link from "next/link";

import type { RecommendedCompetition } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayEmptyState } from "./PlayEmptyState";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

function formatStart(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function tone(index: number): "red" | "gold" | "cyan" {
  return (["red", "gold", "cyan"] as const)[index % 3] ?? "cyan";
}

export function OpportunityRail({
  view,
  onRetry,
}: {
  view: PlayWidgetView<RecommendedCompetition[]>;
  onRetry: () => void;
}) {
  const unresolved =
    (!view.data || view.data.length === 0) &&
    view.state !== "empty" &&
    view.state !== "success";

  return (
    <WidgetFrame
      title="LIVE & UPCOMING"
      eyebrow="HAPPENING NOW IN VERZUS"
      status="VIEW ALL"
      statusHref="/compete"
      className={styles.opportunitiesWidget}
    >
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
          variant="competition"
          title="THE NEXT EVENT HAS NOT DROPPED YET"
          detail="Published competitions will appear here the moment you become eligible."
          primaryAction={{ href: "/compete", label: "EXPLORE COMPETITIONS" }}
        >
          <div className={styles.emptyOpportunityGrid}>
            <span><b>OPEN</b><strong>Competitive cups</strong><small>Awaiting publish</small></span>
            <span><b>WEEKLY</b><strong>Ranked events</strong><small>Awaiting publish</small></span>
            <span><b>CREW</b><strong>Team battles</strong><small>Join a Crew first</small></span>
          </div>
        </PlayEmptyState>
      ) : (
        <div className={styles.opportunityCards}>
          {view.data.slice(0, 3).map((competition, index) => (
            <article data-tone={tone(index)} key={competition.competitionId}>
              <div className={styles.opportunityBackdrop} aria-hidden="true">
                <span>{competition.game.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className={styles.opportunityCopy}>
                <small>{competition.isFeatured ? "FEATURED" : "UP NEXT"}</small>
                <span>{competition.game}</span>
                <h3>{competition.title}</h3>
                <strong>{competition.rewardLabel}</strong>
                <p>{formatStart(competition.startsAt)}</p>
              </div>
              <Link href={`/compete/${competition.competitionId}`}>VIEW DETAILS</Link>
            </article>
          ))}
        </div>
      )}
    </WidgetFrame>
  );
}
