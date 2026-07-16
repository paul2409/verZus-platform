import { Badge } from "@/components/primitives/badge";
import {
  MetricCard,
  MetricGrid,
  OperationalActionLink,
  OperationalGrid,
  OperationalHeader,
  OperationalPage,
  OperationalPanel,
  SignalItem,
  SignalList,
} from "@/components/layout/operational-screen";

import styles from "./NotificationsScreen.module.css";

const notifications = [
  {
    title: "Check-in opens in 30 minutes",
    description: "Mainland Titans vs Island Elites / EA FC / Round 3 of 5.",
    meta: "2M",
    tone: "red",
  },
  {
    title: "Crew War roster confirmed",
    description: "Your EA FC lane is locked for Saturday War Day.",
    meta: "18M",
    tone: "magenta",
  },
  {
    title: "Reward pool funded",
    description: "The Weekly VS Pool now contains 250,000 VS Credits.",
    meta: "1H",
    tone: "gold",
  },
  {
    title: "Rank increased",
    description: "You moved from #7 to #4 on the Lagos EA FC weekly table.",
    meta: "4H",
    tone: "green",
  },
  {
    title: "Scouting report available",
    description: "Island Elites updated their expected War Day lineup.",
    meta: "1D",
    tone: "cyan",
  },
] as const;

export function NotificationsScreen() {
  return (
    <OperationalPage>
      <OperationalHeader
        actions={
          <OperationalActionLink href="/settings" variant="secondary">
            Notification settings
          </OperationalActionLink>
        }
        description="Match, Crew, ranking, reward, and security signals in one operational feed."
        eyebrow="09.2 // SIGNAL FEED"
        status={<Badge tone="live">3 unread</Badge>}
        title="NOTIFICATIONS"
      />

      <MetricGrid>
        <MetricCard detail="action required" label="Unread" tone="red" value="3" />
        <MetricCard detail="this week" label="Match alerts" tone="cyan" value="8" />
        <MetricCard detail="Crew activity" label="War signals" tone="magenta" value="5" />
        <MetricCard detail="credited" label="Rewards" tone="gold" value="2" />
      </MetricGrid>

      <OperationalGrid columns={3}>
        <OperationalPanel title="All signals" tone="green">
          <p className={styles.filterCopy}>
            Everything from matches, Crews, rewards, and security.
          </p>
        </OperationalPanel>
        <OperationalPanel title="Competition" tone="cyan">
          <p className={styles.filterCopy}>Check-in, result, rank, and dispute notifications.</p>
        </OperationalPanel>
        <OperationalPanel title="Crew and rewards" tone="magenta">
          <p className={styles.filterCopy}>War Week, roster, scouting, and funded-pool updates.</p>
        </OperationalPanel>
      </OperationalGrid>

      <OperationalGrid columns={2}>
        <OperationalPanel
          description="Newest operational signals appear first."
          eyebrow="Live feed"
          title="Priority notifications"
          tone="cyan"
        >
          <SignalList>
            {notifications.map((item) => (
              <SignalItem
                description={item.description}
                key={item.title}
                meta={item.meta}
                title={item.title}
                tone={item.tone}
              />
            ))}
          </SignalList>
        </OperationalPanel>

        <OperationalPanel
          description="Only high-value signals interrupt active play."
          eyebrow="Delivery"
          title="Signal policy"
          tone="gold"
        >
          <SignalList>
            <SignalItem
              description="Check-in and match-start alerts remain enabled."
              meta="ON"
              title="Competitive alerts"
              tone="green"
            />
            <SignalItem
              description="War Week roster and Crew challenge signals."
              meta="ON"
              title="Crew alerts"
              tone="magenta"
            />
            <SignalItem
              description="Cash and Bonus Credit movements require confirmation."
              meta="SECURE"
              title="Reward alerts"
              tone="gold"
            />
            <SignalItem
              description="New device and account-security events."
              meta="ON"
              title="Security alerts"
              tone="cyan"
            />
          </SignalList>
        </OperationalPanel>
      </OperationalGrid>
    </OperationalPage>
  );
}
