import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";

import { Avatar, CrewIdentity, PlayerIdentity } from "@/components/primitives/avatar";
import {
  Badge,
  MovementBadge,
  RankBadge,
  StatValue,
  StatusBadge,
} from "@/components/primitives/badge";
import {
  BottomNavigation,
  BottomNavigationItem,
  NavigationBadge,
} from "@/components/primitives/bottom-navigation";
import { Button } from "@/components/primitives/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineState,
  PartialFailureState,
  SuccessState,
} from "@/components/primitives/feedback";
import { SegmentedControl, SegmentedControlItem } from "@/components/primitives/segmented-control";
import { Tab, TabList, TabPanel, Tabs } from "@/components/primitives/tabs";

import styles from "./DesignSystemBaseline.module.css";

type StoryFrameProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function StoryFrame({ title, description, children }: StoryFrameProps) {
  return (
    <main className={styles.frame} data-visual-ready="true">
      <header className={styles.header}>
        <p className={styles.kicker}>VERZUS / M2 / Visual Baseline</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </header>
      {children}
    </main>
  );
}

function NavigationGlyph({ label }: { label: string }) {
  return <span className={styles.navigationGlyph}>{label}</span>;
}

const meta = {
  title: "Design System/Baseline",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {
  render: () => (
    <StoryFrame
      description="Semantic colour, display typography and data-first hierarchy used across VERZUS."
      title="Visual Foundation"
    >
      <div className={styles.stack}>
        <section className={styles.surface}>
          <div className={styles.swatches}>
            <div className={styles.swatch} data-tone="green">
              Positive
            </div>
            <div className={styles.swatch} data-tone="cyan">
              Information
            </div>
            <div className={styles.swatch} data-tone="violet">
              Crew
            </div>
            <div className={styles.swatch} data-tone="magenta">
              Featured
            </div>
            <div className={styles.swatch} data-tone="gold">
              Rank
            </div>
            <div className={styles.swatch} data-tone="red">
              Danger
            </div>
          </div>
        </section>

        <section className={styles.surface}>
          <p className={styles.typeDisplay}>Play. Rank. Rise.</p>
          <p className={styles.typeBody}>
            Rajdhani leads competitive display moments. Inter carries interface copy, explanations
            and operational detail.
          </p>
          <div className={styles.row} style={{ marginTop: "1.25rem" }}>
            <StatValue label="Season rank" tone="warning" value="#04" />
            <StatValue label="Record" tone="positive" value="18-4" />
            <StatValue label="Win rate" suffix="%" tone="information" value="81.8" />
          </div>
        </section>
      </div>
    </StoryFrame>
  ),
};

export const BadgesAndIdentities: Story = {
  render: () => (
    <StoryFrame
      description="Status, ranking, movement, player identity and Crew identity rendered together."
      title="Badges & Identities"
    >
      <div className={styles.grid}>
        <section className={styles.surface}>
          <h2>Competitive status</h2>
          <div className={styles.row}>
            <Badge tone="positive">Ready</Badge>
            <Badge tone="information" variant="outline">
              Check-in open
            </Badge>
            <Badge tone="warning">Awaiting opponent</Badge>
            <Badge tone="negative">Disputed</Badge>
            <Badge tone="special">Crew war</Badge>
            <StatusBadge pulse={false} status="live">
              Live
            </StatusBadge>
          </div>
        </section>

        <section className={styles.surface}>
          <h2>Rank movement</h2>
          <div className={styles.row}>
            <RankBadge rank={1} tier="elite" />
            <RankBadge rank={4} tier="gold" />
            <RankBadge rank={18} tier="silver" />
            <MovementBadge movement="increased" value={3} />
            <MovementBadge movement="decreased" value={2} />
            <MovementBadge movement="new" />
          </div>
        </section>

        <section className={styles.surface}>
          <h2>Player identity</h2>
          <div className={styles.identityStack}>
            <PlayerIdentity
              avatarTone="green"
              badge={<Badge tone="positive">Verified</Badge>}
              handle="@jayflex"
              metadata="18 wins / 4 losses"
              name="Jay Flex"
              presence="online"
              trailing={<RankBadge rank={4} tier="gold" />}
              verified
            />
            <PlayerIdentity
              avatarTone="cyan"
              handle="@nova9"
              metadata="Check-in pending"
              name="Nova Nine"
              presence="away"
            />
          </div>
        </section>

        <section className={styles.surface}>
          <h2>Crew identity</h2>
          <div className={styles.identityStack}>
            <CrewIdentity
              badge={<Badge tone="special">Elite Crew</Badge>}
              emblemTone="violet"
              memberCount={12}
              metadata="Crew War ready"
              name="Night Ravens"
              tag="NRV"
              verified
            />
            <div className={styles.row}>
              <Avatar name="Jay Flex" presence="online" size="lg" tone="green" verified />
              <Avatar name="Nova Nine" presence="away" size="lg" tone="cyan" />
              <Avatar name="Rex Storm" presence="busy" shape="hex" size="lg" tone="violet" />
            </div>
          </div>
        </section>
      </div>
    </StoryFrame>
  ),
};

export const SelectionControls: Story = {
  render: () => (
    <StoryFrame
      description="Keyboard-ready tabs and segmented controls across standard competitive filtering states."
      title="Selection Controls"
    >
      <div className={styles.grid}>
        <section className={styles.surface}>
          <h2>Navigation tabs</h2>
          <Tabs defaultValue="overview" size="md" tone="primary">
            <TabList>
              <Tab value="overview">Overview</Tab>
              <Tab
                value="matches"
                trailingVisual={
                  <Badge size="sm" tone="information">
                    4
                  </Badge>
                }
              >
                Matches
              </Tab>
              <Tab value="crew">Crew</Tab>
              <Tab disabled value="rewards">
                Rewards
              </Tab>
            </TabList>
            <div className={styles.controlPanel}>
              <TabPanel value="overview">
                <p>Current competitive overview is selected.</p>
              </TabPanel>
              <TabPanel value="matches">
                <p>Match history is selected.</p>
              </TabPanel>
              <TabPanel value="crew">
                <p>Crew activity is selected.</p>
              </TabPanel>
              <TabPanel value="rewards">
                <p>Rewards are unavailable.</p>
              </TabPanel>
            </div>
          </Tabs>
        </section>

        <section className={styles.surface}>
          <h2>Leaderboard period</h2>
          <div className={styles.stack}>
            <SegmentedControl defaultValue="weekly" fullWidth size="md">
              <SegmentedControlItem value="daily">Daily</SegmentedControlItem>
              <SegmentedControlItem value="weekly">Weekly</SegmentedControlItem>
              <SegmentedControlItem value="season">Season</SegmentedControlItem>
            </SegmentedControl>
            <SegmentedControl defaultValue="players" fullWidth size="sm" tone="secondary">
              <SegmentedControlItem value="players">Players</SegmentedControlItem>
              <SegmentedControlItem value="crews">Crews</SegmentedControlItem>
              <SegmentedControlItem disabled value="friends">
                Friends
              </SegmentedControlItem>
            </SegmentedControl>
            <div className={styles.row}>
              <Button leadingIcon="play">Enter match</Button>
              <Button variant="secondary">View bracket</Button>
              <Button variant="ghost">Rules</Button>
            </div>
          </div>
        </section>
      </div>
    </StoryFrame>
  ),
};

export const FeedbackStates: Story = {
  render: () => (
    <StoryFrame
      description="Independent presentational states used after schema, adapter, cache and view-model processing."
      title="Feedback States"
    >
      <div className={styles.stateGrid}>
        <LoadingState
          compact
          description="Fetching the latest match state."
          size="sm"
          title="Loading match"
        />
        <SuccessState
          compact
          description="Your check-in has been recorded."
          size="sm"
          title="Checked in"
        />
        <EmptyState
          compact
          description="No competitions match this filter."
          size="sm"
          title="Nothing found"
        />
        <ErrorState
          compact
          description="The match widget failed without taking down navigation."
          size="sm"
          title="Match unavailable"
        />
        <OfflineState
          compact
          description="Cached ranking data remains available."
          size="sm"
          title="You are offline"
        />
        <PartialFailureState
          compact
          description="Crew activity failed, but the next match is still usable."
          size="sm"
          title="Some data is unavailable"
        />
      </div>
    </StoryFrame>
  ),
};

export const BottomNavigationBaseline: Story = {
  render: () => (
    <StoryFrame
      description="Five mobile destinations with a prominent Play action, route state and resilient notification indicators."
      title="Bottom Navigation"
    >
      <section className={styles.navigationStage}>
        <BottomNavigation items={5} position="static" variant="elevated">
          <BottomNavigationItem
            current
            href="/"
            icon={<NavigationGlyph label="H" />}
            label="Home"
          />
          <BottomNavigationItem
            href="/rankings"
            icon={<NavigationGlyph label="R" />}
            label="Rank"
          />
          <BottomNavigationItem
            href="/play"
            icon={<NavigationGlyph label="P" />}
            label="Play"
            prominent
          />
          <BottomNavigationItem
            badge={<NavigationBadge count={3} label="3 Crew notifications" tone="primary" />}
            href="/crew"
            icon={<NavigationGlyph label="C" />}
            label="Crew"
            state="partial"
          />
          <BottomNavigationItem
            href="/profile"
            icon={<NavigationGlyph label="U" />}
            label="Profile"
          />
        </BottomNavigation>
      </section>
      <p className={styles.note}>
        The baseline uses static positioning so the complete navigation can be captured in
        isolation.
      </p>
    </StoryFrame>
  ),
};
