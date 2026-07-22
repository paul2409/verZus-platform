"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { PlayCheckInAction } from "../actions/use-play-check-in";
import type { CurrentCheckIn, NextMatch } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayEmptyState } from "./PlayEmptyState";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import { StatusChip } from "./StatusChip";
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

function formatClock(value: string | null): string {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(value))
    .toUpperCase();
}

function useCountdown(match: NextMatch | null) {
  const offset = useMemo(() => {
    if (!match) return 0;
    return new Date(match.serverNow).getTime() - Date.now();
  }, [match]);

  const calculate = () => {
    if (!match) return 0;
    return Math.max(0, new Date(match.startsAt).getTime() - (Date.now() + offset));
  };

  const [remaining, setRemaining] = useState(calculate);

  useEffect(() => {
    setRemaining(calculate());
    if (!match) return;
    const timer = window.setInterval(() => setRemaining(calculate()), 1000);
    return () => window.clearInterval(timer);
  }, [match, offset]);

  const totalSeconds = Math.floor(remaining / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function timelineState(
  step: "checkin" | "lobby" | "ready" | "kickoff" | "results",
  match: NextMatch,
  checkIn: CurrentCheckIn | null,
): "done" | "active" | "pending" {
  if (step === "checkin") {
    if (checkIn?.state === "checked_in") return "done";
    if (checkIn?.state === "open") return "active";
    return "pending";
  }

  if (step === "lobby") {
    if (["starting_soon", "in_progress", "completed"].includes(match.status)) return "done";
    if (match.status === "checked_in") return "active";
    return "pending";
  }

  if (step === "ready") {
    if (["in_progress", "completed"].includes(match.status)) return "done";
    if (match.status === "starting_soon") return "active";
    return "pending";
  }

  if (step === "kickoff") {
    if (match.status === "completed") return "done";
    if (match.status === "in_progress") return "active";
    return "pending";
  }

  return match.status === "completed" ? "done" : "pending";
}

export function PrimaryActionPanel({
  nextMatch,
  currentCheckIn,
  checkInAction,
  retryNextMatch,
  retryCheckIn,
}: {
  nextMatch: PlayWidgetView<NextMatch>;
  currentCheckIn: PlayWidgetView<CurrentCheckIn>;
  checkInAction: PlayCheckInAction;
  retryNextMatch: () => void;
  retryCheckIn: () => void;
}) {
  const match = nextMatch.data;
  const checkIn = currentCheckIn.data;
  const countdown = useCountdown(match);

  if (!match) {
    const unresolved = nextMatch.state !== "empty" && nextMatch.state !== "success";

    return (
      <section className={`${styles.widget} ${styles.nextMatchPanel} ${styles.emptyNextMatchPanel}`}>
        <header className={styles.widgetHeader}>
          <div>
            <h2>NEXT MATCH</h2>
          </div>
          <StatusChip tone="scheduled">NO SCHEDULE</StatusChip>
        </header>
        <div className={styles.nextMatchEmpty}>
          {unresolved ? (
            <PlayWidgetStatePanel
              state={nextMatch.state}
              errorCode={nextMatch.errorCode}
              requestId={nextMatch.requestId}
              onRetry={retryNextMatch}
            />
          ) : (
            <PlayEmptyState
              variant="match"
              title="YOUR NEXT MATCH STARTS HERE"
              detail="Enter an eligible competition. When your fixture is confirmed, this becomes your live countdown, check-in desk, and match command centre."
              primaryAction={{ href: "/compete", label: "FIND A COMPETITION" }}
              secondaryAction={{ href: "/matches", label: "VIEW MY MATCHES" }}
              steps={[
                "Choose an eligible competition",
                "Confirm your entry",
                "Return here when the fixture is scheduled",
              ]}
            />
          )}
        </div>
      </section>
    );
  }

  const canCheckIn = checkIn?.canCheckIn && checkInAction.state !== "pending";
  const checkedIn = checkIn?.state === "checked_in";
  const canEnter = checkedIn && ["starting_soon", "in_progress"].includes(match.status);
  const statusTone = ["starting_soon", "in_progress"].includes(match.status)
    ? "live"
    : checkedIn
      ? "verified"
      : "scheduled";

  const timeline = [
    {
      key: "checkin" as const,
      label: "CHECK IN",
      detail: checkedIn ? "Complete" : formatClock(checkIn?.opensAt ?? null),
    },
    { key: "lobby" as const, label: "LOBBY", detail: formatClock(match.checkInClosesAt) },
    { key: "ready" as const, label: "READY CHECK", detail: "Before kickoff" },
    { key: "kickoff" as const, label: "KICK OFF", detail: formatClock(match.startsAt) },
    {
      key: "results" as const,
      label: "RESULTS",
      detail: match.status === "completed" ? "Confirmed" : "TBD",
    },
  ];

  return (
    <section
      className={`${styles.widget} ${styles.nextMatchPanel}`}
      aria-labelledby="play-next-match-title"
    >
      <div className={styles.nextMatchVisual}>
        <div className={styles.matchArenaBackdrop} aria-hidden="true" />
        <div className={styles.matchTeams}>
          <div className={styles.teamIdentity} data-current="true">
            <span className={styles.teamCrest}>V</span>
            <strong>{match.self.handle}</strong>
            <small>#{match.self.rank ?? "—"}</small>
          </div>
          <b>VS</b>
          <div className={styles.teamIdentity}>
            <span className={styles.teamCrest}>
              {match.opponent.handle.slice(0, 2).toUpperCase()}
            </span>
            <strong>{match.opponent.handle}</strong>
            <small>#{match.opponent.rank ?? "—"}</small>
          </div>
        </div>
        <div className={styles.matchVisualMeta}>
          <span>{match.format}</span>
          <span>{formatDate(match.startsAt)}</span>
        </div>
      </div>

      <div className={styles.nextMatchCommand}>
        <header>
          <div>
            <small>NEXT MATCH</small>
            <h2 id="play-next-match-title">{match.competitionName}</h2>
          </div>
          <StatusChip tone={statusTone}>{match.status.replaceAll("_", " ")}</StatusChip>
        </header>

        <div className={styles.countdownBlock}>
          <span>STARTS IN</span>
          <div>
            <strong>{String(countdown.hours).padStart(2, "0")}</strong>
            <i>:</i>
            <strong>{String(countdown.minutes).padStart(2, "0")}</strong>
            <i>:</i>
            <strong>{String(countdown.seconds).padStart(2, "0")}</strong>
          </div>
          <small>
            <span>HRS</span>
            <span>MINS</span>
            <span>SECS</span>
          </small>
        </div>

        <div className={styles.matchCommandActions}>
          {canEnter ? (
            <Link className={styles.heroPrimaryButton} href={`/matches/${match.matchId}`}>
              ENTER MATCH
            </Link>
          ) : (
            <button
              className={styles.heroPrimaryButton}
              type="button"
              disabled={!canCheckIn}
              aria-busy={checkInAction.state === "pending"}
              onClick={() => checkIn && checkInAction.checkIn(checkIn)}
            >
              {checkInAction.state === "pending"
                ? "CHECKING IN..."
                : checkedIn
                  ? "CHECKED IN"
                  : canCheckIn
                    ? "CHECK IN"
                    : "CHECK-IN CLOSED"}
            </button>
          )}
          <Link className={styles.heroSecondaryButton} href={`/matches/${match.matchId}`}>
            MATCH DETAILS
          </Link>
        </div>

        {checkInAction.state === "error" ? (
          <button className={styles.inlineError} type="button" onClick={checkInAction.reset}>
            CHECK-IN FAILED · RETRY
          </button>
        ) : null}
        {!checkIn && currentCheckIn.state === "error" ? (
          <button className={styles.inlineError} type="button" onClick={retryCheckIn}>
            CHECK-IN STATUS UNAVAILABLE · RETRY
          </button>
        ) : null}
      </div>

      <div className={styles.matchTimeline}>
        {timeline.map((item) => (
          <div data-state={timelineState(item.key, match, checkIn)} key={item.key}>
            <span aria-hidden="true" />
            <strong>{item.label}</strong>
            <small>{item.detail}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
