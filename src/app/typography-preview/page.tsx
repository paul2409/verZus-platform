import styles from "./page.module.css";

const rankingRows = [
  {
    rank: 1,
    player: "KAIRO",
    record: "24W–3L",
    points: "892",
    movement: "▲ 2",
    movementTone: "positive",
  },
  {
    rank: 2,
    player: "R3DSTORM",
    record: "12W–2L",
    points: "841",
    movement: "▼ 1",
    movementTone: "negative",
  },
  {
    rank: 3,
    player: "FEMISKILLZ",
    record: "22W–7L",
    points: "798",
    movement: "● 0",
    movementTone: "neutral",
  },
  {
    rank: 4,
    player: "JAYFLEX",
    record: "18W–4L",
    points: "721",
    movement: "▲ 1",
    movementTone: "positive",
  },
];

export default function TypographyPreviewPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <p className="vz-eyebrow">M2 // Typography Hierarchy</p>

          <div className={styles.referenceComposition}>
            <div className={styles.referenceCopy}>
              <h1 aria-label="Every game is a Verzus" className="vz-display-xl">
                Every game
                <br aria-hidden="true" />
                is a Verzus
              </h1>

              <h2 className="vz-heading-lg">Standings &amp; tables</h2>

              <p className="vz-body-md">
                Welcome back, <strong className="vz-text-primary">JAYFLEX</strong>.
              </p>

              <p className="vz-numeric-lg">2,310</p>

              <p className="vz-label-cap">
                Week 14&nbsp;&nbsp;•&nbsp;&nbsp;12–18 May 2025&nbsp;&nbsp;•&nbsp;&nbsp;18:30 WAT
              </p>
            </div>

            <dl className={styles.referenceSpecs}>
              <div>
                <dt>DISPLAY-XL</dt>
                <dd>40px / 700 / uppercase</dd>
              </div>

              <div>
                <dt>HEADING-LG</dt>
                <dd>24px / 600</dd>
              </div>

              <div>
                <dt>BODY-MD</dt>
                <dd>14px / 400</dd>
              </div>

              <div>
                <dt>NUMERIC-LG</dt>
                <dd>28px / 700 / tabular</dd>
              </div>

              <div>
                <dt>LABEL-CAP</dt>
                <dd>11px / 500 / tracking</dd>
              </div>
            </dl>
          </div>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm">Complete hierarchy</h2>
            <p className="vz-caption">Approved shared typography roles</p>
          </div>

          <div className={styles.roleGrid}>
            <article className={styles.roleCard}>
              <p className="vz-label-cap">Display XL</p>
              <p className="vz-display-xl">VERZUS</p>
              <code>40px / Rajdhani 700</code>
            </article>

            <article className={styles.roleCard}>
              <p className="vz-label-cap">Display LG</p>
              <p className="vz-display-lg">Season Zero</p>
              <code>32px / Rajdhani 700</code>
            </article>

            <article className={styles.roleCard}>
              <p className="vz-label-cap">Heading LG</p>
              <p className="vz-heading-lg">Weekly standings</p>
              <code>24px / Rajdhani 600</code>
            </article>

            <article className={styles.roleCard}>
              <p className="vz-label-cap">Heading MD</p>
              <p className="vz-heading-md">Match operations</p>
              <code>20px / Rajdhani 600</code>
            </article>

            <article className={styles.roleCard}>
              <p className="vz-label-cap">Heading SM</p>
              <p className="vz-heading-sm">Current position</p>
              <code>16px / Rajdhani 600</code>
            </article>

            <article className={styles.roleCard}>
              <p className="vz-label-cap">Body LG</p>
              <p className="vz-body-lg">
                Prominent supporting information for important operational contexts.
              </p>
              <code>16px / Inter 400</code>
            </article>

            <article className={styles.roleCard}>
              <p className="vz-label-cap">Body MD</p>
              <p className="vz-body-md">
                Standard interface copy for cards, forms, and workflow instructions.
              </p>
              <code>14px / Inter 400</code>
            </article>

            <article className={styles.roleCard}>
              <p className="vz-label-cap">Body SM</p>
              <p className="vz-body-sm">Compact supporting copy and low-priority metadata.</p>
              <code>12px / Inter 400</code>
            </article>

            <article className={styles.roleCard}>
              <p className="vz-label-cap">Numeric LG</p>
              <p className="vz-numeric-lg">2,310</p>
              <code>28px / Inter 700 / tabular</code>
            </article>

            <article className={styles.roleCard}>
              <p className="vz-label-cap">Numeric MD</p>
              <p className="vz-numeric-md">72.4%</p>
              <code>20px / Inter 600 / tabular</code>
            </article>

            <article className={styles.roleCard}>
              <p className="vz-label-cap">Label CAP</p>
              <p className="vz-label-cap">Leaderboard updated</p>
              <code>11px / Rajdhani 500</code>
            </article>

            <article className={styles.roleCard}>
              <p className="vz-label-cap">Caption</p>
              <p className="vz-caption">Updated just now</p>
              <code>12px / Inter 400</code>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="vz-heading-sm">Dense data composition</h2>
            <p className="vz-caption">Tabular metrics and predictable hierarchy</p>
          </div>

          <div className={styles.rankingTable}>
            <div className={styles.rankingHeader}>
              <span>Rank</span>
              <span>Player</span>
              <span>Record</span>
              <span>Pts</span>
              <span>Movement</span>
            </div>

            {rankingRows.map((row) => (
              <article
                className={row.player === "JAYFLEX" ? styles.currentRow : styles.rankingRow}
                key={row.player}
              >
                <span className="vz-numeric-sm">{row.rank}</span>

                <strong className={styles.playerName}>{row.player}</strong>

                <span className="vz-numeric-sm">{row.record}</span>

                <span className="vz-numeric-sm vz-numeric--positive">{row.points}</span>

                <span
                  className={
                    row.movementTone === "positive"
                      ? styles.positiveMovement
                      : row.movementTone === "negative"
                        ? styles.negativeMovement
                        : styles.neutralMovement
                  }
                >
                  {row.movement}
                </span>
              </article>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <span className="vz-label-cap">Display: Rajdhani</span>
          <span className="vz-label-cap">Interface: Inter</span>
          <span className="vz-label-cap">Metrics: Tabular</span>
        </footer>
      </section>
    </main>
  );
}
