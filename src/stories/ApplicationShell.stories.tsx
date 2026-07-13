// VERZUS M3 STEP 3.8

import type { Meta, StoryObj } from "@storybook/react";

import { AppShell } from "@/components/layout/app-shell";
import { WidgetErrorFallback, WidgetUnavailableState } from "@/components/layout/widget-boundary";

import styles from "./ApplicationShell.module.css";

const profile = {
  name: "Jayflex",
  handle: "jayflex",
  title: "Elite Competitor",
  initials: "JF",
  presence: "online",
  points: 2840,
  crewName: "Mainland Titans",
} as const;

const operationalStatus = {
  kind: "operational",
  label: "All systems operational",
  detail: "Live platform services available",
} as const;

const degradedStatus = {
  kind: "degraded",
  label: "Some services are delayed",
  detail: "Leaderboard refreshes may take longer than usual",
} as const;

const offlineStatus = {
  kind: "offline",
  label: "Offline mode",
  detail: "Cached and offline-safe destinations remain available",
} as const;

function ShellContent({ isolatedFailure = false }: { isolatedFailure?: boolean }) {
  return (
    <div className={styles.dashboard}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Player command centre</p>
        <h1 className={styles.title}>Ready for the next competition</h1>
        <p className={styles.description}>
          Check your next match, current position, Crew activity and available competitions without
          leaving the persistent VERZUS shell.
        </p>
        <div className={styles.actionRow}>
          <a className={styles.action} href="/matches">
            Open next match
          </a>
        </div>
      </section>

      <div className={styles.grid}>
        <section className={`${styles.panel} ${styles.matchPanel}`}>
          <h2>Next match</h2>
          <p>Check-in opens in 42 minutes.</p>
          <div className={styles.matchRow}>
            <div className={styles.participant}>
              <strong>Jayflex</strong>
              <span>Weekly rank 17</span>
            </div>
            <div className={styles.participant}>
              <strong>Lagos Lynx</strong>
              <span>Weekly rank 12</span>
            </div>
          </div>
          <div className={styles.metricGrid}>
            <div className={styles.metric}>
              <span>Kick-off</span>
              <strong>20:30</strong>
            </div>
            <div className={styles.metric}>
              <span>Format</span>
              <strong>BO3</strong>
            </div>
          </div>
        </section>

        <section className={styles.panel} data-accent="gold">
          <h2>Current position</h2>
          <div className={styles.metricGrid}>
            <div className={styles.metric}>
              <span>Weekly rank</span>
              <strong>#17</strong>
            </div>
            <div className={styles.metric}>
              <span>Movement</span>
              <strong>+3</strong>
            </div>
          </div>
        </section>

        {isolatedFailure ? (
          <WidgetErrorFallback errorId="CREW-PULSE-503" name="Crew pulse" />
        ) : (
          <section className={styles.panel} data-accent="violet">
            <h2>Crew pulse</h2>
            <p>Mainland Titans moved into second place.</p>
            <ul className={styles.activity}>
              <li>Two Crew members are online.</li>
              <li>Next Crew War begins tomorrow.</li>
            </ul>
          </section>
        )}

        <section className={styles.panel}>
          <h2>Opportunities</h2>
          <ul className={styles.activity}>
            <li>Weekend Open — registration closes in six hours.</li>
            <li>Rookie Cup — eligibility confirmed.</li>
          </ul>
        </section>

        <section className={styles.panel}>
          <h2>Recent activity</h2>
          <ul className={styles.activity}>
            <li>Match result confirmed against Island Strikers.</li>
            <li>Weekly ranking increased by three places.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function ShellStory({
  status = operationalStatus,
  routeLoading = false,
  offline = false,
  isolatedFailure = false,
}: {
  status?: typeof operationalStatus | typeof degradedStatus | typeof offlineStatus;
  routeLoading?: boolean;
  offline?: boolean;
  isolatedFailure?: boolean;
}) {
  return (
    <div className={styles.visualRoot} data-visual-ready="true">
      <AppShell
        currentPath="/play"
        notificationCount={3}
        offline={offline}
        profile={profile}
        routeLoading={routeLoading}
        status={status}
      >
        <ShellContent isolatedFailure={isolatedFailure} />
      </AppShell>
    </div>
  );
}

const meta = {
  title: "M3/Application Shell",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Operational: Story = {
  render: () => <ShellStory />,
};

export const Degraded: Story = {
  render: () => <ShellStory status={degradedStatus} />,
};

export const Offline: Story = {
  render: () => <ShellStory offline status={offlineStatus} />,
};

export const RouteLoading: Story = {
  render: () => <ShellStory routeLoading />,
};

export const IsolatedWidgetFailure: Story = {
  render: () => <ShellStory isolatedFailure />,
};

export const OfflineWidgetUnavailable: Story = {
  render: () => (
    <div className={styles.visualRoot} data-visual-ready="true">
      <AppShell
        currentPath="/play"
        notificationCount={3}
        offline
        profile={profile}
        status={offlineStatus}
      >
        <div className={styles.dashboard}>
          <WidgetUnavailableState name="Recommended competitions" variant="offline" />
        </div>
      </AppShell>
    </div>
  ),
};
