// VERZUS M5 STEPS 5.5-5.8
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
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
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
      eyebrow="04 · OPPORTUNITIES"
      title="Enter next"
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
          {view.data.map((competition) => (
            <article key={competition.competitionId} data-featured={competition.isFeatured}>
              <div>
                <span>{competition.game}</span>
                <strong>{competition.title}</strong>
                <small>
                  {competition.format} · {formatStart(competition.startsAt)}
                </small>
              </div>

              <div className={styles.opportunityMeta}>
                <b>{competition.rewardLabel}</b>
                <small>{competition.entryLabel}</small>
              </div>

              <Link href={`/compete/${competition.competitionId}`}>VIEW</Link>
            </article>
          ))}
        </div>
      )}
    </WidgetFrame>
  );
}
