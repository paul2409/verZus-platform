import styles from "./page.module.css";

export default function TypographyPreviewPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <header className={styles.header}>
          <p className="vz-eyebrow">M2 // Typography System</p>

          <h1 className="vz-display-lg">Built For Competition</h1>

          <p className="vz-body-lg">
            VERZUS uses a compact, high-contrast type system designed for fast scanning, live match
            operations, rankings, and high-density competitive interfaces.
          </p>
        </header>

        <div className={styles.section}>
          <p className="vz-label">Display styles</p>

          <div className={styles.stack}>
            <div className={styles.sample}>
              <span className={styles.tokenName}>display-xl</span>
              <p className="vz-display-xl">VERZUS</p>
            </div>

            <div className={styles.sample}>
              <span className={styles.tokenName}>display-lg</span>
              <p className="vz-display-lg">Season Zero</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <p className="vz-label">Heading styles</p>

          <div className={styles.stack}>
            <div className={styles.sample}>
              <span className={styles.tokenName}>heading-lg</span>
              <h2 className="vz-heading-lg">Weekly Pool Standings</h2>
            </div>

            <div className={styles.sample}>
              <span className={styles.tokenName}>heading-md</span>
              <h3 className="vz-heading-md">Your Next Match</h3>
            </div>

            <div className={styles.sample}>
              <span className={styles.tokenName}>heading-sm</span>
              <h4 className="vz-heading-sm">Crew Activity</h4>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <p className="vz-label">Body styles</p>

          <div className={styles.stack}>
            <div className={styles.sample}>
              <span className={styles.tokenName}>body-lg</span>
              <p className="vz-body-lg">
                Check in before the deadline to secure your place in the match.
              </p>
            </div>

            <div className={styles.sample}>
              <span className={styles.tokenName}>body-md</span>
              <p className="vz-body-md">
                Your opponent has confirmed availability. Match operations will unlock when both
                players are ready.
              </p>
            </div>

            <div className={styles.sample}>
              <span className={styles.tokenName}>body-sm</span>
              <p className="vz-body-sm">Rankings update after confirmed results.</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <p className="vz-label">Labels and metadata</p>

          <div className={styles.metadataGrid}>
            <div className={styles.metaCard}>
              <p className="vz-eyebrow">Live Status</p>
              <p className="vz-caption">Updated 2 minutes ago</p>
            </div>

            <div className={styles.metaCard}>
              <p className="vz-label">Current Rank</p>
              <p className="vz-numeric vz-numeric--brand">#128</p>
            </div>

            <div className={styles.metaCard}>
              <p className="vz-label">Win Rate</p>
              <p className="vz-numeric vz-numeric--positive">72.4%</p>
            </div>

            <div className={styles.metaCard}>
              <p className="vz-label">Rank Change</p>
              <p className="vz-numeric vz-numeric--negative">-3</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <p className="vz-label">Link style</p>

          <a className="vz-link" href="#typography-preview">
            View full leaderboard
          </a>
        </div>
      </section>
    </main>
  );
}
