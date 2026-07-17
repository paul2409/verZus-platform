"use client";

// VERZUS M7.2 SERVER-ANCHORED COUNTDOWN

import { useEffect, useState } from "react";

import { formatMatchClockValue } from "../model/match-clock.policy";
import type { MatchClockSnapshot } from "../model/match-operations.types";
import styles from "./MatchOperationsScreen.module.css";

export type ServerCountdownProps = {
  clock: MatchClockSnapshot;
  caption: string | null;
  fallbackLabel: string | null;
};

function getClockMilliseconds(
  clock: MatchClockSnapshot,
  authoritativeNowMs: number,
): number | null {
  if (clock.mode === "none" || !clock.activeDeadlineAt) return null;

  const deadlineMs = Date.parse(clock.activeDeadlineAt);
  return clock.mode === "elapsed"
    ? authoritativeNowMs - deadlineMs
    : deadlineMs - authoritativeNowMs;
}

export function ServerCountdown({ clock, caption, fallbackLabel }: ServerCountdownProps) {
  const serverAnchorMs = Date.parse(clock.serverNow);
  const [authoritativeNowMs, setAuthoritativeNowMs] = useState(serverAnchorMs);

  useEffect(() => {
    const clientAnchorMs = Date.now();

    const update = () => {
      const elapsedClientMs = Date.now() - clientAnchorMs;
      setAuthoritativeNowMs(serverAnchorMs + elapsedClientMs);
    };

    update();
    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, [serverAnchorMs]);

  const milliseconds = getClockMilliseconds(clock, authoritativeNowMs);
  const value =
    milliseconds === null
      ? fallbackLabel
      : formatMatchClockValue(milliseconds, Math.abs(milliseconds) >= 86_400_000);

  if (!value) return null;

  return (
    <div
      aria-label="Server-authoritative match clock"
      data-clock-mode={clock.mode}
      data-server-authoritative="true"
    >
      <strong className={styles.timer} data-testid="server-countdown">
        {value}
      </strong>
      {caption ? <span className={styles.timerCaption}>{caption}</span> : null}
    </div>
  );
}
