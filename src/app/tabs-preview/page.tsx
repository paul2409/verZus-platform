"use client";

import { useState } from "react";

import { Badge, StatusBadge } from "@/components/primitives/badge";
import {
  Panel,
  PanelBody,
  PanelDescription,
  PanelEyebrow,
  PanelHeader,
  PanelHeadingGroup,
  PanelStatus,
  PanelTitle,
} from "@/components/primitives/panel";
import { SegmentedControl, SegmentedControlItem } from "@/components/primitives/segmented-control";
import { Tab, TabList, TabPanel, Tabs } from "@/components/primitives/tabs";

import styles from "./page.module.css";

export default function TabsPreviewPage() {
  const [competitionView, setCompetitionView] = useState("available");

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.kicker}>VERZUS Design System · M2 Step 12</p>
        <h1 className={styles.title}>Tabs and Segmented Controls</h1>
        <p className={styles.description}>
          Keyboard-complete navigation for player sections, Crew activity, leaderboards, matches,
          and competition filters.
        </p>
      </header>

      <Panel aria-labelledby="mobile-tabs-title" density="spacious" tone="primary">
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelEyebrow>390px reference behaviour</PanelEyebrow>
            <PanelTitle id="mobile-tabs-title">Player Command Sections</PanelTitle>
            <PanelDescription>
              The tab rail scrolls horizontally on mobile instead of compressing labels.
            </PanelDescription>
          </PanelHeadingGroup>
          <PanelStatus tone="positive">Keyboard ready</PanelStatus>
        </PanelHeader>

        <PanelBody>
          <Tabs defaultValue="overview" tone="primary">
            <TabList aria-label="Player command sections">
              <Tab value="overview">Overview</Tab>
              <Tab
                trailingVisual={
                  <Badge size="sm" tone="live">
                    2
                  </Badge>
                }
                value="matches"
              >
                Matches
              </Tab>
              <Tab value="crew">Crew Activity</Tab>
              <Tab value="rankings">Rankings</Tab>
              <Tab disabled value="rewards">
                Rewards soon
              </Tab>
            </TabList>

            <TabPanel value="overview">
              <section className={styles.contentCard}>
                <StatusBadge status="online">Season services online</StatusBadge>
                <h2>What requires attention now</h2>
                <p>Your next match opens for check-in in 24 minutes.</p>
              </section>
            </TabPanel>

            <TabPanel value="matches">
              <section className={styles.contentCard}>
                <Badge tone="information">2 scheduled</Badge>
                <h2>Upcoming matches</h2>
                <p>JAYFLEX versus R3DSTORM is the next active fixture.</p>
              </section>
            </TabPanel>

            <TabPanel value="crew">
              <section className={styles.contentCard}>
                <Badge tone="special">Night Ravens</Badge>
                <h2>Crew activity</h2>
                <p>Four members moved inside the weekly table.</p>
              </section>
            </TabPanel>

            <TabPanel value="rankings">
              <section className={styles.contentCard}>
                <Badge tone="positive">Rank #04</Badge>
                <h2>Current standing</h2>
                <p>You gained two positions after the latest verified result.</p>
              </section>
            </TabPanel>

            <TabPanel value="rewards">
              <section className={styles.contentCard}>Rewards are not yet available.</section>
            </TabPanel>
          </Tabs>
        </PanelBody>
      </Panel>

      <Panel aria-labelledby="segmented-title" density="spacious" tone="secondary">
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelEyebrow>Compact mode switching</PanelEyebrow>
            <PanelTitle id="segmented-title">Competition Filters</PanelTitle>
            <PanelDescription>
              Segmented controls change a compact view or filter inside the current section.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>

        <PanelBody>
          <div className={styles.controlRow}>
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Competition state</span>
              <SegmentedControl
                aria-label="Competition state"
                fullWidth
                onValueChange={setCompetitionView}
                value={competitionView}
              >
                <SegmentedControlItem value="available">Available</SegmentedControlItem>
                <SegmentedControlItem value="entered">Entered</SegmentedControlItem>
                <SegmentedControlItem value="completed">Completed</SegmentedControlItem>
              </SegmentedControl>
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Leaderboard period</span>
              <SegmentedControl aria-label="Leaderboard period" defaultValue="week" tone="accent">
                <SegmentedControlItem value="day">Day</SegmentedControlItem>
                <SegmentedControlItem value="week">Week</SegmentedControlItem>
                <SegmentedControlItem value="season">Season</SegmentedControlItem>
              </SegmentedControl>
            </div>
          </div>

          <div aria-live="polite" className={styles.selectionResult}>
            Current competition filter: <strong>{competitionView}</strong>
          </div>
        </PanelBody>
      </Panel>

      <Panel aria-labelledby="vertical-title" density="spacious" tone="accent">
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelEyebrow>Desktop expansion</PanelEyebrow>
            <PanelTitle id="vertical-title">Account Operations</PanelTitle>
            <PanelDescription>
              Vertical tabs become a horizontal scroll rail below tablet width.
            </PanelDescription>
          </PanelHeadingGroup>
        </PanelHeader>

        <PanelBody>
          <Tabs defaultValue="profile" orientation="vertical" tone="accent">
            <TabList aria-label="Account operations">
              <Tab value="profile">Player Profile</Tab>
              <Tab value="security">Security</Tab>
              <Tab value="notifications">Notifications</Tab>
              <Tab value="privacy">Privacy</Tab>
            </TabList>

            <TabPanel value="profile">
              <section className={styles.contentCard}>
                <h2>Player profile</h2>
                <p>Manage the identity displayed across competitions and leaderboards.</p>
              </section>
            </TabPanel>

            <TabPanel value="security">
              <section className={styles.contentCard}>
                <h2>Security</h2>
                <p>Review active sessions and high-risk account actions.</p>
              </section>
            </TabPanel>

            <TabPanel value="notifications">
              <section className={styles.contentCard}>
                <h2>Notifications</h2>
                <p>Choose which match and Crew events trigger alerts.</p>
              </section>
            </TabPanel>

            <TabPanel value="privacy">
              <section className={styles.contentCard}>
                <h2>Privacy</h2>
                <p>Control profile visibility and permitted contact methods.</p>
              </section>
            </TabPanel>
          </Tabs>
        </PanelBody>
      </Panel>
    </main>
  );
}
