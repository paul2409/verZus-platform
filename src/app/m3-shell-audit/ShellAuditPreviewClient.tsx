// VERZUS M3 STEP 3.7
"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { AppShell, ContentGrid, PageContainer, PageHeader } from "@/components/layout/app-shell";
import { WidgetBoundary } from "@/components/layout/widget-boundary";

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

function CrashOnRender({
  active,
  label,
  children,
}: {
  active: boolean;
  label: string;
  children?: ReactNode;
}) {
  if (active) {
    throw Object.assign(new Error(`${label} failed during the M3 audit`), {
      digest: `${label.toUpperCase().replaceAll(" ", "-")}-AUDIT`,
    });
  }

  return children ?? null;
}

function StableWidget({ title, description }: { title: string; description: string }) {
  return (
    <article className={styles.widget}>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

export function ShellAuditPreviewClient() {
  const [sidebarFailure, setSidebarFailure] = useState(false);
  const [notificationFailure, setNotificationFailure] = useState(false);
  const [profileFailure, setProfileFailure] = useState(false);
  const [widgetFailure, setWidgetFailure] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [crewsEnabled, setCrewsEnabled] = useState(true);

  const status = offline
    ? {
        kind: "offline" as const,
        label: "Offline mode",
        detail: "Offline-safe navigation remains available",
      }
    : {
        kind: "operational" as const,
        label: "All systems operational",
        detail: "Live services available",
      };

  return (
    <AppShell
      currentPath="/play"
      featureFlags={{
        crews: crewsEnabled,
        rewards: true,
        settings: true,
      }}
      notificationCount={3}
      notificationsContent={
        <CrashOnRender active={notificationFailure} label="Notification content">
          <div className={styles.widget}>
            <h3>Audit notifications</h3>
            <p>Three shell-safe notifications loaded successfully.</p>
          </div>
        </CrashOnRender>
      }
      offline={offline}
      profile={profile}
      profileControl={profileFailure ? <CrashOnRender active label="Profile control" /> : undefined}
      routeLoading={routeLoading}
      sidebarSupplement={
        <CrashOnRender active={sidebarFailure} label="Sidebar intelligence">
          <div className={styles.sidebarAudit}>
            <strong>Shell latency: 42ms</strong>
            <span>Sidebar supplement operational</span>
          </div>
        </CrashOnRender>
      }
      status={status}
    >
      <PageContainer width="wide">
        <div className={styles.page}>
          <PageHeader
            description="Inject controlled failures and verify that navigation, essential actions and unrelated widgets remain operational."
            eyebrow="M3 Step 3.7"
            title="Shell Resilience Audit"
          />

          <section className={styles.section}>
            <h2>Failure controls</h2>
            <p>
              These controls inject failures into isolated shell and widget regions. They must never
              remove the application shell.
            </p>

            <div className={styles.controls} data-testid="m3-audit-controls">
              <button
                className={styles.control}
                data-active={sidebarFailure ? "true" : "false"}
                onClick={() => setSidebarFailure((current) => !current)}
                type="button"
              >
                {sidebarFailure ? "Restore sidebar child" : "Trigger sidebar failure"}
              </button>

              <button
                className={styles.control}
                data-active={notificationFailure ? "true" : "false"}
                onClick={() => setNotificationFailure((current) => !current)}
                type="button"
              >
                {notificationFailure ? "Restore notifications" : "Trigger notification failure"}
              </button>

              <button
                className={styles.control}
                data-active={profileFailure ? "true" : "false"}
                onClick={() => setProfileFailure((current) => !current)}
                type="button"
              >
                {profileFailure ? "Restore profile control" : "Trigger profile failure"}
              </button>

              <button
                className={styles.control}
                data-active={widgetFailure ? "true" : "false"}
                onClick={() => setWidgetFailure((current) => !current)}
                type="button"
              >
                {widgetFailure ? "Restore Crew widget" : "Trigger Crew widget failure"}
              </button>

              <button
                className={styles.control}
                data-active={routeLoading ? "true" : "false"}
                onClick={() => setRouteLoading((current) => !current)}
                type="button"
              >
                {routeLoading ? "Stop route loading" : "Start route loading"}
              </button>

              <button
                className={styles.control}
                data-active={offline ? "true" : "false"}
                onClick={() => setOffline((current) => !current)}
                type="button"
              >
                {offline ? "Return online" : "Enable offline mode"}
              </button>

              <button
                className={styles.control}
                data-active={!crewsEnabled ? "true" : "false"}
                onClick={() => setCrewsEnabled((current) => !current)}
                type="button"
              >
                {crewsEnabled ? "Disable Crews feature" : "Enable Crews feature"}
              </button>

              <Link className={styles.routeLink} href="/shell-audit-route-delay">
                Open delayed route
              </Link>

              <Link className={styles.routeLink} href="/shell-audit-route-crash">
                Open crashing route
              </Link>
            </div>
          </section>

          <ContentGrid layout="three">
            <WidgetBoundary name="Next match">
              <StableWidget
                description="Check-in remains available even when Crew intelligence fails."
                title="Next Match"
              />
            </WidgetBoundary>

            <WidgetBoundary name="Crew pulse" resetKeys={[widgetFailure]}>
              <CrashOnRender active={widgetFailure} label="Crew pulse">
                <StableWidget
                  description="Mainland Titans are second in the weekly championship."
                  title="Crew Pulse"
                />
              </CrashOnRender>
            </WidgetBoundary>

            <WidgetBoundary name="Current position">
              <StableWidget
                description="Weekly rank 17 with movement of three places."
                title="Current Position"
              />
            </WidgetBoundary>
          </ContentGrid>
        </div>
      </PageContainer>
    </AppShell>
  );
}
