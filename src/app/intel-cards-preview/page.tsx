import { CrewIntelCard, crewIntelMock } from "@/features/crews/intel-card";
import {
  MatchIntelCard,
  WarMatchIntelCard,
  matchIntelMock,
  warMatchIntelMock,
} from "@/features/matches/intel-card";
import { PlayerIntelCard, playerIntelMock } from "@/features/profiles/intel-card";

import styles from "./page.module.css";

export default function IntelCardsPreviewPage() {
  return (
    <main className={styles.page!} data-visual-ready="true">
      <header className={styles.hero!}>
        <p>VERZUS / M2 / STEP 19</p>
        <h1>Intel Cards</h1>
        <span>
          Compact, actionable command-centre summaries for players, matches, Crews and live Crew
          wars.
        </span>
      </header>

      <section aria-labelledby="approved-cards" className={styles.section!}>
        <div className={styles.sectionHeading!}>
          <div>
            <p>Approved set</p>
            <h2 id="approved-cards">Four production card families</h2>
          </div>
          <span>390 / 768 / 1440 responsive behaviour</span>
        </div>

        <div className={styles.cardGrid!}>
          <PlayerIntelCard model={playerIntelMock} />
          <MatchIntelCard model={matchIntelMock} />
          <CrewIntelCard model={crewIntelMock} />
          <WarMatchIntelCard model={warMatchIntelMock} />
        </div>
      </section>

      <section aria-labelledby="resilience-states" className={styles.section!}>
        <div className={styles.sectionHeading!}>
          <div>
            <p>Failure isolation</p>
            <h2 id="resilience-states">Supported card states</h2>
          </div>
          <span>Each card fails independently</span>
        </div>

        <div className={styles.stateGrid!}>
          <PlayerIntelCard model={playerIntelMock} state="loading" />
          <MatchIntelCard model={matchIntelMock} state="partial" />
          <CrewIntelCard model={crewIntelMock} state="offline" />
          <WarMatchIntelCard model={warMatchIntelMock} state="error" />
        </div>
      </section>
    </main>
  );
}
