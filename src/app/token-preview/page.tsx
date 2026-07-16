import styles from "./page.module.css";

const coreTokens = [
  ["Void canvas", "--vz-color-bg-deep", "#080A0C", "backgroundDeep"],
  ["Surface base", "--vz-color-surface-base", "#111519", "surfaceBase"],
  ["Surface elevated", "--vz-color-surface-elevated", "#1A2026", "surfaceElevated"],
  ["Primary green", "--vz-color-accent-green", "#00FF87", "green"],
  ["Secondary cyan", "--vz-color-accent-cyan", "#00E5FF", "cyan"],
  ["Live and danger", "--vz-color-status-danger", "#FF3830", "red"],
  ["War and rivalry", "--vz-color-status-magenta", "#FF2D87", "magenta"],
  ["Rank and reward", "--vz-color-rank-gold", "#FFC400", "gold"],
  ["Primary text", "--vz-color-text-primary", "#F1F0FF", "textPrimary"],
  ["Secondary text", "--vz-color-text-secondary", "#8A87B8", "textSecondary"],
] as const;

export default function TokenPreviewPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>11.1 // CANONICAL TOKEN SYSTEM</p>
          <h1 className={styles.title}>VERZUS VISUAL FOUNDATION</h1>
          <p className={styles.description}>
            Neon colours are operational signals. Green owns positive action, cyan owns information
            and focus, red owns live danger, magenta owns rivalry, and gold owns rank and rewards.
          </p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Production colour contract</h2>
          <div className={styles.swatchGrid}>
            {coreTokens.map(([name, token, value, className]) => (
              <article className={styles.swatchCard} key={token}>
                <div aria-hidden="true" className={`${styles.swatch} ${styles[className]}`} />
                <div>
                  <h3 className={styles.swatchName}>{name}</h3>
                  <p className={styles.tokenName}>{token}</p>
                  <p className={styles.tokenValue}>{value}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Typography contract</h2>
          <div className={styles.typeGrid}>
            <article>
              <span>Rajdhani / Display</span>
              <strong>PLAY. RANK. RISE.</strong>
              <p>Uppercase headings, navigation, labels, ranks, scores, and timers.</p>
            </article>
            <article>
              <span>Inter / Body</span>
              <strong>Readable operational copy</strong>
              <p>Forms, rules, descriptions, help text, and long interface content.</p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Signal semantics</h2>
          <div className={styles.semanticGrid}>
            <article className={styles.primaryAction}>
              <span>Primary action</span>
              <strong>CHECK IN NOW</strong>
            </article>
            <article className={styles.secondaryAction}>
              <span>Information</span>
              <strong>VIEW MATCH</strong>
            </article>
            <article className={styles.liveAction}>
              <span>Live danger</span>
              <strong>ROUND 3 / 5</strong>
            </article>
            <article className={styles.warAction}>
              <span>Rivalry</span>
              <strong>WAR WEEK ACTIVE</strong>
            </article>
            <article className={styles.rewardAction}>
              <span>Rank and reward</span>
              <strong>2,310 VS POINTS</strong>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
