"use client";

import Link from "next/link";

import { Icon } from "@/components/primitives/icon";

import type { CurrentCheckIn, NextMatch } from "../model";
import type { PlayCheckInAction } from "../actions/use-play-check-in";
import type { PlayWidgetView } from "../view-model";
import { StatusChip } from "./StatusChip";
import styles from "./play-command-center.module.css";

function countdown(match: NextMatch): string {
  const remaining = Math.max(
    0,
    new Date(match.startsAt).getTime() - new Date(match.serverNow).getTime(),
  );
  const totalMinutes = Math.floor(remaining / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return remaining === 0
    ? "NOW"
    : `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function PlayActionStrip({
  nextMatch,
  currentCheckIn,
  checkInAction,
}: {
  nextMatch: PlayWidgetView<NextMatch>;
  currentCheckIn: PlayWidgetView<CurrentCheckIn>;
  checkInAction: PlayCheckInAction;
}) {
  const match = nextMatch.data;
  const checkIn = currentCheckIn.data;
  const canCheckIn = Boolean(checkIn?.canCheckIn);
  const busy = checkInAction.state === "pending";

  return (
    <section aria-label="Primary play actions" className={styles.actionStrip}>
      <article className={styles.actionCard} data-tone="checkin">
        <header>
          <span>01 // NEXT MATCH</span>
          <StatusChip tone={match ? "live" : "locked"}>
            {match ? countdown(match) : "OPEN"}
          </StatusChip>
        </header>
        <strong>
          {match ? `${match.self.handle} VS ${match.opponent.handle}` : "NO MATCH LOCKED"}
        </strong>
        <p>
          {match
            ? `${match.competitionName} · ${canCheckIn ? "CHECK-IN OPEN" : "STANDBY"}`
            : "Queue ranked or enter a qualifier to start."}
        </p>
        {canCheckIn && checkIn ? (
          <button
            disabled={busy}
            onClick={() => checkInAction.checkIn(checkIn)}
            type="button"
          >
            {busy ? "CHECKING IN…" : "CHECK IN NOW"}
            <Icon decorative name="check" size="sm" />
          </button>
        ) : (
          <Link href="/compete">
            FIND A MATCH
            <Icon decorative name="chevron-right" size="sm" />
          </Link>
        )}
      </article>

      <article className={styles.actionCard} data-tone="climb">
        <header>
          <span>02 // CLIMB NOW</span>
          <StatusChip tone="verified">HOT</StatusChip>
        </header>
        <strong>RANKED LADDER OPEN</strong>
        <p>Jump a bracket, bank VS points, and keep your streak alive.</p>
        <Link href="/leaderboards">
          VIEW RANKINGS
          <Icon decorative name="trophy" size="sm" />
        </Link>
      </article>
    </section>
  );
}
