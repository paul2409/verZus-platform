import { Icon } from "@/components/primitives/icon";

import styles from "./MatchesScreen.module.css";

const activeMatches = [
  {
    id: "cod-titan",
    time: "LIVE",
    live: true,
    match: "TITANONE vs XENOLYNX",
    game: "COD",
    tone: "orange" as const,
    detail: "BO5 · SQUAD",
    ranks: "#18 vs #15",
  },
  {
    id: "fc-prodigy",
    time: "19:15",
    live: false,
    match: "PRODIGY vs BLAQBIRD",
    game: "EA FC",
    tone: "green" as const,
    detail: "BO3 · 1V1",
    ranks: "#07 vs #11",
  },
  {
    id: "clash-mainland",
    time: "20:00",
    live: false,
    match: "MAINLAND vs LAGOS LYNX",
    game: "CLASH",
    tone: "blue" as const,
    detail: "BO5 · CREW",
    ranks: "#03 vs #05",
  },
  {
    id: "league-kairo",
    time: "21:30",
    live: false,
    match: "KAIRO vs R3DSTORM",
    game: "LEAGUE",
    tone: "purple" as const,
    detail: "BO3 · DUO",
    ranks: "#12 vs #09",
  },
] as const;

export function MatchesScreen() {
  return (
    <main className={styles.page} data-stage-4-screen="matches">
      <header className={styles.header}>
        <p className={styles.eyebrow}>05.0 // WATCH LANE</p>
        <h1>ACTIVE MATCHES</h1>
      </header>

      <section aria-labelledby="active-matches-title" className={styles.table} data-vz-surface="panel">
        <h2 className={styles.srOnly} id="active-matches-title">
          Active matches
        </h2>
        <div aria-hidden="true" className={styles.tableHeader}>
          <span>TIME</span>
          <span>MATCH</span>
          <span>#</span>
        </div>
        <ul className={styles.rows}>
          {activeMatches.map((row) => (
            <li
              className={styles.row}
              data-tone={row.tone}
              data-vz-surface="row"
              key={row.id}
            >
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
                <button className={styles.watchButton} data-vz-cta="primary" type="button">
                  WATCH
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className={styles.footerNote}>
        <Icon decorative name="eye" size="xs" />
        LIVE AND UPCOMING LOBBIES REFRESH AUTOMATICALLY
      </p>
    </main>
  );
}
