import { Badge, StatValue } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Icon } from "@/components/primitives/icon";
import {
  Panel,
  PanelActions,
  PanelBody,
  PanelDescription,
  PanelEyebrow,
  PanelGrid,
  PanelHeader,
  PanelHeadingGroup,
  PanelModule,
  PanelTitle,
} from "@/components/primitives/panel";
import { AppShell, ContentGrid, PageContainer, PageHeader } from "@/components/layout/app-shell";

import styles from "./page.module.css";

const profile = {
  name: "Jayflex",
  handle: "@jayflex",
  title: "Elite Competitor",
  initials: "JF",
  presence: "online" as const,
  points: 2310,
  crewName: "Mainland Titans",
};

const status = {
  kind: "operational" as const,
  label: "Online",
  detail: "All systems operational",
};

const notifications = (
  <div className={styles.notificationList}>
    <article>
      <Icon decorative name="clock" size="md" tone="secondary" />
      <div>
        <strong>Check-in reminder</strong>
        <span>Your match starts at 18:30.</span>
      </div>
      <time>2m</time>
    </article>
    <article>
      <Icon decorative name="users" size="md" tone="warning" />
      <div>
        <strong>Crew invitation</strong>
        <span>Lagos Lynx invited you.</span>
      </div>
      <time>12m</time>
    </article>
    <article>
      <Icon decorative name="trophy" size="md" tone="primary" />
      <div>
        <strong>Weekly rank update</strong>
        <span>You are now number one.</span>
      </div>
      <time>2h</time>
    </article>
  </div>
);

export default function ShellPreviewPage() {
  return (
    <AppShell
      currentPath="/play"
      notificationCount={4}
      notificationsContent={notifications}
      profile={profile}
      status={status}
    >
      <PageContainer>
        <PageHeader
          actions={
            <>
              <Button size="sm" variant="secondary">
                Create Crew
              </Button>
              <Button size="sm">Invite Friends</Button>
            </>
          }
          description="Here is what is happening in VERZUS."
          eyebrow="Player command centre"
          title="Welcome back, Jayflex"
        />

        <ContentGrid>
          <section className={styles.primaryColumn}>
            <Panel tone="primary">
              <PanelHeader>
                <PanelHeadingGroup>
                  <PanelEyebrow>Next match</PanelEyebrow>
                  <PanelTitle>Check-in open</PanelTitle>
                  <PanelDescription>War Day · Week 14 · Best of 3</PanelDescription>
                </PanelHeadingGroup>
                <Badge tone="positive" variant="outline">
                  Check-in open
                </Badge>
              </PanelHeader>
              <PanelBody>
                <div className={styles.versusBlock}>
                  <div>
                    <span className={styles.crewMark}>MT</span>
                    <strong>Mainland Titans</strong>
                    <small>Home</small>
                  </div>
                  <div className={styles.matchTime}>
                    <span>Starts in</span>
                    <strong>18:30</strong>
                    <small>BO3</small>
                  </div>
                  <div>
                    <span className={`${styles.crewMark} ${styles.crewMarkRed}`}>LLX</span>
                    <strong>Lagos Lynx</strong>
                    <small>Away</small>
                  </div>
                </div>
              </PanelBody>
              <PanelActions>
                <Button fullWidth leadingIcon="check" size="lg">
                  Check in now
                </Button>
                <Button fullWidth size="lg" variant="ghost">
                  View match details
                </Button>
              </PanelActions>
            </Panel>

            <Panel density="compact">
              <PanelHeader>
                <PanelHeadingGroup>
                  <PanelEyebrow>Quick actions</PanelEyebrow>
                  <PanelTitle as="h2">Command shortcuts</PanelTitle>
                </PanelHeadingGroup>
              </PanelHeader>
              <PanelBody>
                <div className={styles.quickActions}>
                  {[
                    ["target", "Find match", "Ranked"],
                    ["calendar", "View schedule", "Your matches"],
                    ["trophy", "Leaderboards", "All rankings"],
                    ["gift", "Rewards", "Your progress"],
                  ].map(([icon, title, detail]) => (
                    <button key={title} type="button">
                      <Icon decorative name={icon as "target"} size="lg" tone="primary" />
                      <strong>{title}</strong>
                      <span>{detail}</span>
                    </button>
                  ))}
                </div>
              </PanelBody>
            </Panel>

            <PanelGrid columns={2}>
              <PanelModule>
                <PanelEyebrow>Upcoming matches</PanelEyebrow>
                <div className={styles.listRows}>
                  <span>
                    <strong>Today · 18:30</strong>
                    <small>vs Lagos Lynx</small>
                  </span>
                  <span>
                    <strong>Tomorrow · 20:00</strong>
                    <small>vs Yaba Volt</small>
                  </span>
                </div>
              </PanelModule>
              <PanelModule>
                <PanelEyebrow>Recent activity</PanelEyebrow>
                <div className={styles.listRows}>
                  <span>
                    <strong>Match completed</strong>
                    <small>Victory · +120 XP</small>
                  </span>
                  <span>
                    <strong>Crew war win</strong>
                    <small>Mainland Titans · +90 pts</small>
                  </span>
                </div>
              </PanelModule>
            </PanelGrid>
          </section>

          <aside className={styles.secondaryColumn}>
            <Panel tone="accent">
              <PanelHeader>
                <PanelHeadingGroup>
                  <PanelEyebrow>Weekly pool</PanelEyebrow>
                  <PanelTitle>EA FC · Week 14</PanelTitle>
                </PanelHeadingGroup>
              </PanelHeader>
              <PanelBody>
                <div className={styles.statsGrid}>
                  <StatValue label="Rank" size="lg" tone="positive" value="#1" />
                  <StatValue label="VS points" size="lg" tone="positive" value="1,240" />
                  <StatValue label="Next tier" detail="Target: Top 10%" value="Top 15%" />
                </div>
                <div className={styles.progressTrack}>
                  <span style={{ width: "62%" }} />
                </div>
              </PanelBody>
              <PanelActions>
                <Button fullWidth variant="secondary">
                  View pool standings
                </Button>
              </PanelActions>
            </Panel>

            <Panel tone="secondary">
              <PanelHeader>
                <PanelHeadingGroup>
                  <PanelEyebrow>Crew snapshot</PanelEyebrow>
                  <PanelTitle>Mainland Titans</PanelTitle>
                  <PanelDescription>Tier 1 Crew · 6 of 8 members</PanelDescription>
                </PanelHeadingGroup>
              </PanelHeader>
              <PanelBody>
                <div className={styles.statsGrid}>
                  <StatValue label="Crew rank" tone="special" value="#2" />
                  <StatValue label="War record" value="12–3" />
                  <StatValue label="Win rate" tone="positive" value="68.5%" />
                </div>
              </PanelBody>
              <PanelActions>
                <Button fullWidth variant="secondary">
                  View Crew HQ
                </Button>
              </PanelActions>
            </Panel>
          </aside>
        </ContentGrid>
      </PageContainer>
    </AppShell>
  );
}
