import { Badge } from "@/components/primitives/badge";
import { Avatar } from "@/components/primitives/avatar";
import {
  MetricCard,
  MetricGrid,
  OperationalActionLink,
  OperationalGrid,
  OperationalHeader,
  OperationalPage,
  OperationalPanel,
  ProgressMeter,
  SignalItem,
  SignalList,
} from "@/components/layout/operational-screen";

import styles from "./ProfileScreen.module.css";

const games = [
  ["EA FC", "Division 2", "18-5", "green"],
  ["COD Mobile", "Master III", "12-8", "cyan"],
  ["Clash Royale", "7,240 trophies", "21-11", "gold"],
  ["League", "Gold I", "9-7", "violet"],
] as const;

export function ProfileScreen() {
  return (
    <OperationalPage>
      <OperationalHeader
        actions={
          <>
            <OperationalActionLink href="/settings">Edit profile</OperationalActionLink>
            <OperationalActionLink href="/leaderboards/weekly" variant="secondary">
              View rankings
            </OperationalActionLink>
          </>
        }
        description="Competitive identity, game form, Crew membership, trust, and account readiness."
        eyebrow="08.1 // PLAYER IDENTITY"
        status={<Badge tone="positive">Verified</Badge>}
        title="JAYFLEX"
      />

      <section className={styles.identityCard}>
        <Avatar name="Jay Flex" presence="online" size="xl" tone="cyan" verified />
        <div className={styles.identityCopy}>
          <div className={styles.badges}>
            <Badge tone="positive">Elite</Badge>
            <Badge tone="information" variant="outline">
              Lagos
            </Badge>
            <Badge tone="special">Mainland Titans</Badge>
          </div>
          <h2>JAY FLEX</h2>
          <p>@jayflex / Captain-ready flex player / War Day available</p>
        </div>
        <div className={styles.rankBlock}>
          <span>Season rank</span>
          <strong data-rank>#04</strong>
          <small>Up 3 this week</small>
        </div>
      </section>

      <MetricGrid>
        <MetricCard detail="competitive score" label="VS Points" tone="green" value="2,310" />
        <MetricCard detail="verified account" label="Trust" tone="cyan" value="96" />
        <MetricCard detail="all games" label="Record" tone="gold" value="60-31" />
        <MetricCard detail="current season" label="Win rate" tone="magenta" value="65.9%" />
      </MetricGrid>

      <OperationalGrid columns={2}>
        <OperationalPanel
          description="Current competitive form across the four supported lanes."
          eyebrow="Primary games"
          title="Game card"
          tone="green"
        >
          <SignalList>
            {games.map(([title, description, meta, tone]) => (
              <SignalItem
                description={description}
                key={title}
                meta={meta}
                title={title}
                tone={tone}
              />
            ))}
          </SignalList>
        </OperationalPanel>

        <OperationalPanel
          description="Account and competition eligibility signals."
          eyebrow="Readiness"
          title="Player license"
          tone="cyan"
        >
          <div className={styles.progressStack}>
            <ProgressMeter detail="96 / 100" label="Trust score" max={100} value={96} />
            <ProgressMeter detail="4 / 4" label="Game lanes" max={4} tone="cyan" value={4} />
            <ProgressMeter detail="5 / 6" label="Profile readiness" max={6} tone="gold" value={5} />
          </div>
          <SignalList>
            <SignalItem
              description="Email, phone, and player identity confirmed."
              meta="READY"
              title="Identity verification"
              tone="green"
            />
            <SignalItem
              description="Saturday 18:00-23:00 WAT is marked available."
              meta="WAR DAY"
              title="Availability"
              tone="magenta"
            />
          </SignalList>
        </OperationalPanel>
      </OperationalGrid>

      <OperationalGrid columns={2}>
        <OperationalPanel
          action={
            <OperationalActionLink href="/crews" variant="secondary">
              Crew HQ
            </OperationalActionLink>
          }
          description="Current club identity and weekly contribution."
          eyebrow="Crew"
          title="Mainland Titans"
          tone="magenta"
        >
          <SignalList>
            <SignalItem
              description="Crew championship position"
              meta="#02"
              title="Season standing"
              tone="gold"
            />
            <SignalItem
              description="Points contributed across three game lanes"
              meta="420 PTS"
              title="Weekly contribution"
              tone="green"
            />
            <SignalItem
              description="EA FC lane check-in opens Friday at 20:00 WAT"
              meta="SCHEDULED"
              title="Next Crew duty"
              tone="cyan"
            />
          </SignalList>
        </OperationalPanel>

        <OperationalPanel
          description="Latest verified results."
          eyebrow="Recent form"
          title="Match record"
          tone="gold"
        >
          <div className={styles.formRow} aria-label="Recent form: win, win, loss, win, win">
            <span data-result="win">W</span>
            <span data-result="win">W</span>
            <span data-result="loss">L</span>
            <span data-result="win">W</span>
            <span data-result="win">W</span>
          </div>
          <SignalList>
            <SignalItem
              description="EA FC / 3-1 / Verified"
              meta="2H"
              title="vs Island Elites"
              tone="green"
            />
            <SignalItem
              description="COD Mobile / 1-3 / Verified"
              meta="1D"
              title="vs Shadow Unit"
              tone="red"
            />
          </SignalList>
        </OperationalPanel>
      </OperationalGrid>
    </OperationalPage>
  );
}
