// VERZUS M3 STEP 3.6
"use client";

import { useState } from "react";

import {
  GlobalStatusBar,
  ShellNotificationsDrawer,
  ShellProfileMenu,
  ShellSearchModal,
  ShellStatusRegion,
} from "@/components/layout/app-shell";
import type { GlobalShellStatus } from "@/components/layout/app-shell";

import styles from "./page.module.css";

const profile = {
  name: "Jayflex",
  handle: "jayflex",
  title: "Elite Competitor",
  initials: "JF",
  presence: "online",
  points: 2840,
  crewName: "Mainland Titans",
} as const;

const statuses: readonly GlobalShellStatus[] = [
  {
    kind: "operational",
    label: "All systems operational",
    detail: "Live services available",
  },
  {
    kind: "degraded",
    label: "Some services are delayed",
    detail: "Leaderboard refreshes may take longer than usual",
  },
  {
    kind: "offline",
    label: "Offline mode",
    detail: "Cached and offline-safe destinations remain available",
  },
  {
    kind: "maintenance",
    label: "Scheduled maintenance",
    detail: "Competition entry is temporarily unavailable",
  },
];

export function ShellOverlaysPreviewClient() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [status, setStatus] = useState<GlobalShellStatus>(statuses[0]!);
  const [routeLoading, setRouteLoading] = useState(false);

  return (
    <>
      <section className={styles.section}>
        <h2>Global overlays</h2>
        <p>
          Open search, notifications and the profile menu. Escape, backdrop dismissal, focus
          trapping and focus restoration come from the shared M2 overlay primitives.
        </p>

        <div className={styles.controls}>
          <button className={styles.control} onClick={() => setSearchOpen(true)} type="button">
            Open search
          </button>
          <button
            className={styles.control}
            onClick={() => setNotificationsOpen(true)}
            type="button"
          >
            Open notifications
          </button>
          <div className={styles.profilePreview}>
            <ShellProfileMenu profile={profile} routeKey="/shell-overlays-preview" />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Status behaviour</h2>
        <p>
          Switch between operational, degraded, offline and maintenance states, then activate the
          non-blocking global loading notice.
        </p>

        <div className={styles.statusGrid}>
          {statuses.map((item) => (
            <button
              className={styles.statusControl}
              key={item.kind}
              onClick={() => setStatus(item)}
              type="button"
            >
              {item.kind}
            </button>
          ))}
        </div>

        <button
          className={styles.control}
          onClick={() => setRouteLoading((current) => !current)}
          type="button"
        >
          {routeLoading ? "Stop route loading" : "Start route loading"}
        </button>

        <GlobalStatusBar detail={status.detail} kind={status.kind} label={status.label} />
      </section>

      <ShellStatusRegion routeLoading={routeLoading} status={status} />

      <ShellSearchModal onOpenChange={setSearchOpen} open={searchOpen} />

      <ShellNotificationsDrawer
        notificationCount={3}
        onOpenChange={setNotificationsOpen}
        open={notificationsOpen}
      />
    </>
  );
}
