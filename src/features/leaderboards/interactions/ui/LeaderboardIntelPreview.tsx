"use client";

// VERZUS M8.9 API-BACKED INTEL DRAWER AND MOBILE SHEET
// VERZUS M8.10 FOCUS, HISTORY AND CLOSE RELIABILITY

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

import type { LeaderboardFoundationRow } from "../../foundation";
import { recordLeaderboardIntelTelemetry } from "../../telemetry";
import {
  buildLeaderboardIntelHref,
  findLeaderboardIntelSubject,
  type LeaderboardIntelSelection,
} from "../model/leaderboard-interaction.types";
import { LeaderboardIntelResourceCard } from "./LeaderboardIntelResourceCard";
import styles from "./LeaderboardInteractions.module.css";

function focusTrigger(selection: LeaderboardIntelSelection): void {
  window.setTimeout(() => {
    document.getElementById(`intel-trigger-${selection.kind}-${selection.entityId}`)?.focus();
  }, 0);
}

export function LeaderboardIntelPreview({
  rows,
  selection,
}: {
  rows: readonly LeaderboardFoundationRow[];
  selection: LeaderboardIntelSelection | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const previousSelectionRef = useRef<LeaderboardIntelSelection | null>(selection);
  const subject = useMemo(
    () => (selection ? findLeaderboardIntelSubject(selection, rows) : null),
    [rows, selection],
  );
  const entityIntelEnabled = process.env.NEXT_PUBLIC_ENABLE_M8_ENTITY_INTEL !== "false";

  const close = useCallback(() => {
    if (!selection) return;
    router.replace(buildLeaderboardIntelHref(pathname, searchParams, null), { scroll: false });
  }, [pathname, router, searchParams, selection]);

  useEffect(() => {
    const previous = previousSelectionRef.current;
    if (previous && !selection) {
      recordLeaderboardIntelTelemetry("intel_closed", previous.kind, previous.entityId);
      focusTrigger(previous);
    }
    previousSelectionRef.current = selection;
  }, [selection]);

  useEffect(() => {
    if (!selection) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close, selection]);

  if (!selection || !entityIntelEnabled) return null;

  const title = subject?.descriptor.label ?? selection.entityId;

  return (
    <div className={styles.intelLayer} data-intel-kind={selection.kind} data-m8-intel-stage="8.10">
      <button
        aria-label="Close intel card"
        className={styles.backdrop}
        onClick={close}
        type="button"
      />
      <aside
        aria-describedby="leaderboard-intel-description"
        aria-labelledby="leaderboard-intel-title"
        aria-modal="true"
        className={styles.intelPanel}
        ref={panelRef}
        role="dialog"
      >
        <header className={styles.intelHeader}>
          <div>
            <span>{selection.kind} intel</span>
            <h2 id="leaderboard-intel-title">{title}</h2>
          </div>
          <button aria-label="Close intel card" onClick={close} ref={closeButtonRef} type="button">
            ×
          </button>
        </header>

        <p className={styles.intelDescription} id="leaderboard-intel-description">
          Independently cached {selection.kind} intelligence validated against the owning domain
          contract. A failed card does not remove the leaderboard.
        </p>

        <LeaderboardIntelResourceCard selection={selection} />

        <div className={styles.intelActions}>
          <button onClick={close} type="button">
            Return to rankings
          </button>
        </div>
      </aside>
    </div>
  );
}

export function LeaderboardColorLegend() {
  return (
    <section className={styles.colorLegend} aria-labelledby="ranking-color-legend-title">
      <h2 id="ranking-color-legend-title">Ranking colors</h2>
      <p>
        <span data-zone="champion" /> Champion
      </p>
      <p>
        <span data-zone="podium" /> Podium
      </p>
      <p>
        <span data-zone="promotion" /> Promotion zone
      </p>
      <p>
        <span data-zone="current" /> Your position
      </p>
    </section>
  );
}
