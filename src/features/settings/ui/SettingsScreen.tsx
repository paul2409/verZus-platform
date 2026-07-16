import { Badge } from "@/components/primitives/badge";
import { Switch } from "@/components/primitives/switch";
import {
  OperationalActionLink,
  OperationalGrid,
  OperationalHeader,
  OperationalPage,
  OperationalPanel,
  SignalItem,
  SignalList,
} from "@/components/layout/operational-screen";

import styles from "./SettingsScreen.module.css";

export function SettingsScreen() {
  return (
    <OperationalPage>
      <OperationalHeader
        actions={
          <OperationalActionLink href="/profile" variant="secondary">
            Back to profile
          </OperationalActionLink>
        }
        description="Account security, communication, privacy, and competitive preferences."
        eyebrow="10.4 // CONTROL PANEL"
        status={<Badge tone="positive">Account secure</Badge>}
        title="SETTINGS"
      />

      <OperationalGrid columns={2}>
        <OperationalPanel
          description="High-risk account actions remain server-authorized."
          eyebrow="Account"
          title="Security and identity"
          tone="cyan"
        >
          <SignalList>
            <SignalItem
              description="Primary email and mobile number are verified."
              meta="VERIFIED"
              title="Player identity"
              tone="green"
            />
            <SignalItem
              description="Authenticator challenge required for reward withdrawals."
              meta="ENABLED"
              title="Two-factor authentication"
              tone="cyan"
            />
            <SignalItem
              description="Last active device: Windows desktop / Lagos."
              meta="NOW"
              title="Active session"
              tone="gold"
            />
          </SignalList>
          <div className={styles.actionRow}>
            <OperationalActionLink href="/session-expired" variant="ghost">
              Review sessions
            </OperationalActionLink>
          </div>
        </OperationalPanel>

        <OperationalPanel
          description="Control which operational signals can interrupt active play."
          eyebrow="Notifications"
          title="Signal preferences"
          tone="magenta"
        >
          <div className={styles.switchStack}>
            <Switch
              defaultChecked
              description="Check-in, match-start, result, and dispute alerts."
              label="Competitive alerts"
            />
            <Switch
              defaultChecked
              description="War Week, roster, challenge, and scouting signals."
              label="Crew alerts"
            />
            <Switch
              defaultChecked
              description="Cash Credit, Bonus Credit, and funded-pool activity."
              label="Reward alerts"
            />
            <Switch
              description="Optional product and event announcements."
              label="Platform updates"
            />
          </div>
        </OperationalPanel>
      </OperationalGrid>

      <OperationalGrid columns={2}>
        <OperationalPanel
          description="Public records support fair competition while private data remains restricted."
          eyebrow="Privacy"
          title="Competitive visibility"
          tone="green"
        >
          <div className={styles.switchStack}>
            <Switch
              defaultChecked
              description="Show verified game record, rank, and VS Points."
              label="Public competitive card"
            />
            <Switch
              defaultChecked
              description="Allow verified Crews to view your primary game lanes."
              label="Crew scouting visibility"
            />
            <Switch
              description="Allow direct challenge requests from players outside your Crew."
              label="Open challenges"
            />
          </div>
        </OperationalPanel>

        <OperationalPanel
          description="These settings affect matchmaking presentation, not competitive integrity."
          eyebrow="Competition"
          title="Play preferences"
          tone="gold"
        >
          <div className={styles.switchStack}>
            <Switch
              defaultChecked
              description="Prefer competition results with verified Crew affiliation."
              label="Crew-first discovery"
            />
            <Switch
              defaultChecked
              description="Show local Lagos competitions before national events."
              label="Local competition priority"
            />
            <Switch
              defaultChecked
              description="Warn when a match overlaps your saved War Day availability."
              label="Schedule conflict warnings"
            />
          </div>
        </OperationalPanel>
      </OperationalGrid>

      <OperationalPanel
        description="VS Points are competitive score. VS Credits are rewards. They remain separate in all account views."
        eyebrow="Data semantics"
        title="Points and credits"
        tone="cyan"
      >
        <div className={styles.creditGrid}>
          <article>
            <span>VS Points</span>
            <strong>Ranking score</strong>
            <p>Used for standings, seeding, and championship position.</p>
          </article>
          <article>
            <span>Cash Credits</span>
            <strong>Withdrawable reward</strong>
            <p>Paid from funded reward pools after server-side verification.</p>
          </article>
          <article>
            <span>Bonus Credits</span>
            <strong>Platform reward</strong>
            <p>Used inside VERZUS and never presented as withdrawable cash.</p>
          </article>
        </div>
      </OperationalPanel>
    </OperationalPage>
  );
}
