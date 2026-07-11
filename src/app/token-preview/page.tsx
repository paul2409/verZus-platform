import styles from "./page.module.css";

const coreTokens = [
  {
    name: "Background deep",
    token: "--vz-color-background-deep",
    value: "#080A0C",
    className: styles.backgroundDeep,
  },
  {
    name: "Surface base",
    token: "--vz-color-surface-base",
    value: "#111519",
    className: styles.surfaceBase,
  },
  {
    name: "Surface elevated",
    token: "--vz-color-surface-elevated",
    value: "#1A2026",
    className: styles.surfaceElevated,
  },
  {
    name: "Accent neon",
    token: "--vz-color-green-500",
    value: "#00FF87",
    className: styles.green,
  },
  {
    name: "Accent cyan",
    token: "--vz-color-cyan-500",
    value: "#00E5FF",
    className: styles.cyan,
  },
  {
    name: "Danger",
    token: "--vz-color-red-500",
    value: "#FF3B30",
    className: styles.red,
  },
  {
    name: "Text primary",
    token: "--vz-color-text-primary",
    value: "#FFFFFF",
    className: styles.textPrimary,
  },
  {
    name: "Text secondary",
    token: "--vz-color-text-secondary",
    value: "#8E9AA6",
    className: styles.textSecondary,
  },
];

export default function TokenPreviewPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>M2 // APPROVED TOKEN SYSTEM</p>

          <h1 className={styles.title}>VERZUS VISUAL FOUNDATION</h1>

          <p className={styles.description}>
            The approved dark, competitive, electric system is active. Green owns primary
            operations, cyan owns secondary interaction, and red owns dangerous or urgent states.
          </p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Core colour contract</h2>

          <div className={styles.swatchGrid}>
            {coreTokens.map((token) => (
              <article className={styles.swatchCard} key={token.token}>
                <div aria-hidden="true" className={`${styles.swatch} ${token.className}`} />

                <div>
                  <h3 className={styles.swatchName}>{token.name}</h3>
                  <p className={styles.tokenName}>{token.token}</p>
                  <p className={styles.tokenValue}>{token.value}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Operational semantics</h2>

          <div className={styles.semanticGrid}>
            <article className={styles.primaryAction}>
              <p className={styles.controlLabel}>Primary action</p>
              <strong>CHECK IN NOW</strong>
            </article>

            <article className={styles.secondaryAction}>
              <p className={styles.controlLabel}>Secondary action</p>
              <strong>VIEW CARD</strong>
            </article>

            <article className={styles.dangerAction}>
              <p className={styles.controlLabel}>Danger action</p>
              <strong>REPORT ISSUE</strong>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Surface and status hierarchy</h2>

          <div className={styles.surfaceGrid}>
            <article className={styles.baseCard}>
              <span className={styles.statusOnline}>ONLINE</span>
              <h3>Surface base</h3>
              <p>Standard card, table row, and module background.</p>
            </article>

            <article className={styles.elevatedCard}>
              <span className={styles.statusInfo}>IN GAME</span>
              <h3>Surface elevated</h3>
              <p>Hover state, dropdown, popover, or elevated module.</p>
            </article>

            <article className={styles.liveCard}>
              <span className={styles.statusLive}>LIVE</span>
              <h3>Urgent live state</h3>
              <p>Red remains reserved for danger and urgent operations.</p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Radius and glow</h2>

          <div className={styles.geometryGrid}>
            <div className={styles.controlGeometry}>
              <span>8px</span>
              <p>Buttons and inputs</p>
            </div>

            <div className={styles.cardGeometry}>
              <span>16px</span>
              <p>Cards and containers</p>
            </div>

            <div className={styles.glowGeometry}>
              <span>ACTIVE</span>
              <p>Controlled green operational glow</p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
