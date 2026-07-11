import styles from "./page.module.css";

const rankingRows = [
  {
    rank: 1,
    player: "KAIRO",
    record: "24W–3L",
    points: "892",
  },
  {
    rank: 2,
    player: "R3DSTORM",
    record: "12W–2L",
    points: "841",
  },
  {
    rank: 3,
    player: "FEMISKILLZ",
    record: "22W–7L",
    points: "798",
  },
  {
    rank: 4,
    player: "JAYFLEX",
    record: "18W–4L",
    points: "721",
  },
];

export default function FontPreviewPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.eyebrow} data-font-role="display">
            M2 // FONT SYSTEM
          </p>

          <h1 className={styles.display} data-font-role="display" data-font-preview="rajdhani">
            EVERY GAME
            <br />
            IS A VERZUS
          </h1>

          <p className={styles.introduction} data-font-role="body" data-font-preview="inter">
            Rajdhani owns competitive display text, headings, labels, navigation, and actions. Inter
            owns readable interface copy, metadata, forms, and supporting information.
          </p>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 data-font-role="display">Typography ownership</h2>

            <span data-font-role="body">Two approved families</span>
          </div>

          <div className={styles.fontGrid}>
            <article className={styles.fontCard}>
              <p className={styles.fontRole}>DISPLAY / HEADINGS</p>

              <p className={styles.rajdhaniSample} data-font-role="display">
                RAJDHANI
              </p>

              <p className={styles.fontDescription}>
                Geometric · compact · competitive · uppercase-heavy
              </p>

              <div className={styles.weightList}>
                <span className={styles.weightMedium}>500 Medium</span>
                <span className={styles.weightSemibold}>600 SemiBold</span>
                <span className={styles.weightBold}>700 Bold</span>
              </div>
            </article>

            <article className={styles.fontCard}>
              <p className={styles.fontRole}>INTERFACE / BODY</p>

              <p className={styles.interSample} data-font-role="body">
                Inter
              </p>

              <p className={styles.fontDescription}>
                Clean · legible · neutral · stable in dense interfaces
              </p>

              <div className={styles.interWeightList}>
                <span className={styles.interRegular}>400 Regular</span>
                <span className={styles.interMedium}>500 Medium</span>
                <span className={styles.interSemibold}>600 SemiBold</span>
                <span className={styles.interBold}>700 Bold</span>
              </div>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 data-font-role="display">Numerical stability</h2>

            <span data-font-role="body">Tabular figures</span>
          </div>

          <div className={styles.metricGrid}>
            <article>
              <span>POINTS</span>
              <strong data-numeric>2,310</strong>
            </article>

            <article>
              <span>WIN RATE</span>
              <strong data-numeric>72.4%</strong>
            </article>

            <article>
              <span>RECORD</span>
              <strong data-numeric>24W–3L</strong>
            </article>

            <article>
              <span>CHECK-IN</span>
              <strong data-numeric>18:30</strong>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 data-font-role="display">Ranking alignment</h2>

            <span data-font-role="body">Live data simulation</span>
          </div>

          <div className={styles.rankingTable}>
            <div className={styles.rankingHeader}>
              <span>RANK</span>
              <span>PLAYER</span>
              <span>RECORD</span>
              <span>PTS</span>
            </div>

            {rankingRows.map((row) => (
              <div
                className={row.player === "JAYFLEX" ? styles.currentRow : styles.rankingRow}
                key={row.player}
              >
                <span data-numeric>{row.rank}</span>
                <strong>{row.player}</strong>
                <span data-numeric>{row.record}</span>
                <span className={styles.points} data-numeric>
                  {row.points}
                </span>
              </div>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <span>DISPLAY: RAJDHANI</span>
          <span>INTERFACE: INTER</span>
          <span>NUMERALS: INTER TABULAR</span>
        </footer>
      </section>
    </main>
  );
}
