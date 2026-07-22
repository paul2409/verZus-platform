import Link from "next/link";

import { Icon } from "@/components/primitives/icon";
import type { MatchListItem } from "@/features/matches/operations/server";

import styles from "./MatchesScreen.module.css";

export function MatchesScreen({ items }: { items: MatchListItem[] }) {
  return (
    <main className={styles.page} data-stage-4-screen="matches">
      <header className={styles.header}>
        <p className={styles.eyebrow}>05.0 // MATCH LANE</p>
        <h1>YOUR MATCHES</h1>
      </header>

      <section aria-labelledby="active-matches-title" className={styles.table} data-vz-surface="panel">
        <h2 className={styles.srOnly} id="active-matches-title">
          Active and upcoming matches
        </h2>
        <div aria-hidden="true" className={styles.tableHeader}>
          <span>TIME</span>
          <span>MATCH</span>
          <span>#</span>
        </div>
        {items.length === 0 ? (
          <div data-vz-surface="row" style={{ padding: "2rem" }}>
            <strong>No matches scheduled</strong>
            <p>Your confirmed matches will appear here after competition operations schedule them.</p>
            <Link href="/compete">Find a competition</Link>
          </div>
        ) : (
          <ul className={styles.rows}>
            {items.map((row) => (
              <li className={styles.row} data-tone={row.tone} data-vz-surface="row" key={row.id}>
                <span className={styles.accent} data-tone={row.tone} />
                <div className={styles.timeCell} data-live={row.live ? "true" : undefined}>
                  {row.time}
                </div>
                <div className={styles.matchCell}>
                  <strong>{row.match}</strong>
                  <span>
                    <i data-tone={row.tone} />
                    {row.game}
                    <b>·</b>
                    {row.detail}
                  </span>
                </div>
                <div className={styles.actionCell}>
                  <span>{row.ranks}</span>
                  <Link className={styles.watchButton} data-vz-cta="primary" href={`/matches/${encodeURIComponent(row.id)}`}>
                    OPEN
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className={styles.footerNote}>
        <Icon decorative name="eye" size="xs" />
        MATCH STATE IS CONTROLLED BY SERVER TIME
      </p>
    </main>
  );
}
