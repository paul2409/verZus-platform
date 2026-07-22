"use client";

import Link from "next/link";

import type { NextMatch, RecommendedCompetition } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayEmptyState } from "./PlayEmptyState";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(value))
    .toUpperCase();
}

export function UpNextPanel({
  nextMatch,
  competitions,
  onRetry,
}: {
  nextMatch: PlayWidgetView<NextMatch>;
  competitions: PlayWidgetView<RecommendedCompetition[]>;
  onRetry: () => void;
}) {
  const rows = [
    ...(nextMatch.data
      ? [
          {
            id: `match-${nextMatch.data.matchId}`,
            href: `/matches/${nextMatch.data.matchId}`,
            time: formatDate(nextMatch.data.startsAt),
            title: `vs ${nextMatch.data.opponent.handle}`,
            detail: `${nextMatch.data.format} · ${nextMatch.data.competitionName}`,
            status: nextMatch.data.status === "check_in_open" ? "CHECK IN" : "UPCOMING",
          },
        ]
      : []),
    ...(competitions.data ?? []).slice(0, 3).map((competition) => ({
      id: `competition-${competition.competitionId}`,
      href: `/compete/${competition.competitionId}`,
      time: formatDate(competition.startsAt),
      title: competition.title,
      detail: `${competition.game} · ${competition.format}`,
      status: competition.isFeatured ? "FEATURED" : "UPCOMING",
    })),
  ].slice(0, 3);

  const unresolvedState =
    nextMatch.state !== "success" && nextMatch.state !== "empty"
      ? nextMatch.state
      : competitions.state !== "success" && competitions.state !== "empty"
        ? competitions.state
        : null;

  return (
    <WidgetFrame
      title="UP NEXT"
      status="VIEW FULL SCHEDULE"
      statusHref="/matches"
      className={styles.upNextWidget}
    >
      {rows.length === 0 && unresolvedState ? (
        <PlayWidgetStatePanel
          state={unresolvedState}
          errorCode={nextMatch.errorCode ?? competitions.errorCode}
          requestId={nextMatch.requestId ?? competitions.requestId}
          onRetry={onRetry}
        />
      ) : rows.length === 0 ? (
        <PlayEmptyState
          compact
          variant="schedule"
          title="BUILD YOUR FIRST WEEK"
          detail="Enter a competition and your confirmed matches will assemble here automatically."
          primaryAction={{ href: "/compete", label: "FIND COMPETITION" }}
          secondaryAction={{ href: "/matches", label: "OPEN SCHEDULE" }}
        >
          <div className={styles.emptyScheduleSlots} aria-hidden="true">
            <span><b>01</b><i>Competition entry</i></span>
            <span><b>02</b><i>Fixture confirmed</i></span>
            <span><b>03</b><i>Check in here</i></span>
          </div>
        </PlayEmptyState>
      ) : (
        <div className={styles.upNextList}>
          {rows.map((row, index) => (
            <Link href={row.href} key={row.id}>
              <span className={styles.upNextIcon} aria-hidden="true">
                {index === 0 ? "VS" : index === 1 ? "C" : "T"}
              </span>
              <span>
                <small>{row.time}</small>
                <strong>{row.title}</strong>
                <b>{row.detail}</b>
              </span>
              <em data-active={row.status === "CHECK IN"}>{row.status}</em>
            </Link>
          ))}
        </div>
      )}
    </WidgetFrame>
  );
}
