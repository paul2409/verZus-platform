import { Badge } from "@/components/primitives/badge";
import {
  Panel,
  PanelBody,
  PanelEyebrow,
  PanelHeader,
  PanelTitle,
} from "@/components/primitives/panel";
import {
  AppShell,
  ContentGrid,
  PageContainer,
  PageHeader,
  shellNavigationItems,
  type ShellNavigationItem,
} from "@/components/layout/app-shell";

import styles from "./page.module.css";

const profile = {
  name: "Jayflex",
  title: "Elite Competitor",
  initials: "JF",
  presence: "online" as const,
  points: 2310,
  crewName: "Mainland Titans",
};

const navigationItems: readonly ShellNavigationItem[] = shellNavigationItems.map((item) => {
  if (item.id === "notifications") {
    return {
      ...item,
      notification: {
        count: 4,
        label: "4 unread notifications",
        tone: "danger" as const,
      },
    };
  }

  if (item.id === "matches") {
    return { ...item, state: "disabled" as const };
  }

  return item;
});

const stateRows = [
  ["Active", "Leaderboards", "Nested route detection"],
  ["Partial", "Rewards", "Reachable with degraded capability"],
  ["Disabled", "Matches", "Visible but non-interactive"],
  ["Feature flagged", "Crews", "Hidden from keyboard navigation"],
  ["Loading", "Search", "Temporarily non-interactive"],
  ["Error", "Settings", "Reachable with a degraded marker"],
  ["Notification", "Notifications", "Count announced accessibly"],
] as const;

export default function NavigationStatesPreviewPage() {
  return (
    <AppShell
      currentPath="/leaderboards/weekly/players"
      featureFlags={{ crews: false, rewards: true, settings: true }}
      navigationItems={navigationItems}
      navigationRuntimeStates={{
        rewards: "partial",
        search: "loading",
        settings: "error",
      }}
      notificationCount={4}
      profile={profile}
      status={{
        kind: "degraded",
        label: "Partial service",
        detail: "Navigation remains available while selected features recover.",
      }}
    >
      <PageContainer>
        <PageHeader
          description="Every destination exposes a deterministic, accessible state without depending on page data."
          eyebrow="M3 · Step 3.2"
          title="Navigation state system"
        />

        <ContentGrid layout="two">
          <Panel tone="primary">
            <PanelHeader>
              <div>
                <PanelEyebrow>State contract</PanelEyebrow>
                <PanelTitle>Production navigation states</PanelTitle>
              </div>
              <Badge tone="positive" variant="outline">
                Route-aware
              </Badge>
            </PanelHeader>
            <PanelBody>
              <div className={styles.stateList}>
                {stateRows.map(([state, destination, meaning]) => (
                  <article key={state}>
                    <strong>{state}</strong>
                    <span>{destination}</span>
                    <p>{meaning}</p>
                  </article>
                ))}
              </div>
            </PanelBody>
          </Panel>

          <Panel tone="secondary">
            <PanelHeader>
              <div>
                <PanelEyebrow>Reliability</PanelEyebrow>
                <PanelTitle>Navigation survives feature failure</PanelTitle>
              </div>
            </PanelHeader>
            <PanelBody>
              <ul className={styles.checklist}>
                <li>Current route remains identifiable on nested pages.</li>
                <li>Disabled and loading destinations leave the tab order.</li>
                <li>Partial and error destinations remain reachable.</li>
                <li>Feature flags resolve before rendering navigation actions.</li>
                <li>Offline mode preserves only explicitly safe destinations.</li>
                <li>Notification counts and dots have accessible names.</li>
              </ul>
            </PanelBody>
          </Panel>
        </ContentGrid>
      </PageContainer>
    </AppShell>
  );
}
