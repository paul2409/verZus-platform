"use client";

import Link from "next/link";

import type { RecommendedCompetition } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

function formatStart(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function gameTone(game: string, index: number): "green" | "cyan" | "orange" | "purple" {
  const normalized = game.toLowerCase();

  if (normalized.includes("fc") || normalized.includes("football")) {
    return "orange";
  }

  if (normalized.includes("clash") || normalized.includes("royale")) {
    return "cyan";
  }

  if (normalized.includes("league")) {
    return "purple";
  }

  return (["green", "cyan", "orange", "purple"] as const)[index % 4] ?? "green";
}

export function OpportunityRail({
  view,
  onRetry,
}: {
  view: PlayWidgetView<RecommendedCompetition[]>;
  onRetry: () => void;
}) {
  const featured = view.data?.some((competition) => competition.isFeatured) ?? false;

  return (
    <WidgetFrame
      eyebrow="FEATURED COMPETITIONS"
      title="Enter the arena"
      status={featured ? "FEATURED" : `${view.data?.length ?? 0} OPEN`}
      className={featured ? styles.featuredWidget : undefined}
    >
      {!view.data || view.data.length === 0 ? (
        <PlayWidgetStatePanel
          state={view.state}
          errorCode={view.errorCode}
          requestId={view.requestId}
          onRetry={onRetry}
          emptyTitle="NO RECOMMENDATIONS"
          emptyDetail="Your eligible competitions will appear here."
        />
      ) : (
        <div className={styles.opportunityList}>
          {view.data.map((competition, index) => (
            <article
              className={styles.opportunityCard}
              data-featured={competition.isFeatured}
              data-tone={gameTone(competition.game, index)}
              key={competition.competitionId}
            >
              <div className={styles.opportunityArt} aria-hidden="true">
                <span>{competition.game.slice(0, 2).toUpperCase()}</span>
              </div>

              <div className={styles.opportunityBody}>
                <span>{competition.game}</span>
                <strong>{competition.title}</strong>
                <small>{competition.format}</small>

                <div className={styles.opportunityMeta}>
                  <b>{competition.rewardLabel}</b>
                  <small>{competition.entryLabel}</small>
                </div>
              </div>

              <footer className={styles.opportunityFooter}>
                <span>{formatStart(competition.startsAt)}</span>
                <Link href={`/compete/${competition.competitionId}`}>VIEW</Link>
              </footer>
            </article>
          ))}
        </div>
      )}
    </WidgetFrame>
  );
}
