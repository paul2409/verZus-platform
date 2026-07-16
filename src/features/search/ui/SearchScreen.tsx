import { Badge } from "@/components/primitives/badge";
import { Input } from "@/components/primitives/input";
import {
  OperationalActionLink,
  OperationalGrid,
  OperationalHeader,
  OperationalPage,
  OperationalPanel,
  SignalItem,
  SignalList,
} from "@/components/layout/operational-screen";

import styles from "./SearchScreen.module.css";

export function SearchScreen() {
  return (
    <OperationalPage>
      <OperationalHeader
        description="Find players, Crews, competitions, matches, and public competitive records."
        eyebrow="10.1 // NETWORK SEARCH"
        status={<Badge tone="information">Global index online</Badge>}
        title="SEARCH VERZUS"
      />

      <form action="/search" className={styles.searchForm} method="get" role="search">
        <label htmlFor="verzus-search">Search the competitive network</label>
        <div className={styles.searchRow}>
          <Input
            controlSize="lg"
            id="verzus-search"
            leadingIcon="search"
            name="q"
            placeholder="Player, Crew, competition, or match ID"
            type="search"
          />
          <button type="submit">Search</button>
        </div>
        <p>
          Search results are public competitive records. Private Crew data remains permissioned.
        </p>
      </form>

      <OperationalGrid columns={3}>
        <OperationalPanel title="Players" tone="cyan">
          <p className={styles.categoryCopy}>Handles, game lanes, trust, and public form.</p>
        </OperationalPanel>
        <OperationalPanel title="Crews" tone="magenta">
          <p className={styles.categoryCopy}>
            Club identity, standings, roster readiness, and War Week status.
          </p>
        </OperationalPanel>
        <OperationalPanel title="Competitions" tone="gold">
          <p className={styles.categoryCopy}>
            Open registration, formats, eligibility, and funded rewards.
          </p>
        </OperationalPanel>
      </OperationalGrid>

      <OperationalGrid columns={2}>
        <OperationalPanel
          action={
            <OperationalActionLink href="/leaderboards/weekly" variant="secondary">
              View rankings
            </OperationalActionLink>
          }
          description="High-signal player and Crew records."
          eyebrow="Suggested"
          title="Competitive network"
          tone="green"
        >
          <SignalList>
            <SignalItem
              description="Elite / Mainland Titans / EA FC and COD Mobile"
              meta="#04"
              title="JAYFLEX"
              tone="green"
            />
            <SignalItem
              description="Founding Crew / Lagos / Four game lanes"
              meta="#02"
              title="Mainland Titans"
              tone="magenta"
            />
            <SignalItem
              description="Verified Crew / War Week opponent"
              meta="#05"
              title="Island Elites"
              tone="cyan"
            />
          </SignalList>
        </OperationalPanel>

        <OperationalPanel
          action={<OperationalActionLink href="/compete">Browse all</OperationalActionLink>}
          description="Open and scheduled competitive opportunities."
          eyebrow="Discover"
          title="Competitions"
          tone="gold"
        >
          <SignalList>
            <SignalItem
              description="EA FC / Lagos / Saturday 18:00 WAT"
              meta="OPEN"
              title="Rookie Cup"
              tone="green"
            />
            <SignalItem
              description="League / 5v5 / Eligibility verified"
              meta="12 SPOTS"
              title="Ranked Open"
              tone="cyan"
            />
            <SignalItem
              description="COD Mobile / Crew squads / Weekly VS Pool"
              meta="SAT"
              title="Squad Battles"
              tone="gold"
            />
          </SignalList>
        </OperationalPanel>
      </OperationalGrid>
    </OperationalPage>
  );
}
