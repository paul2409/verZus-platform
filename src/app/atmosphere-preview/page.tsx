import styles from "./page.module.css";

const operationalRows = [
  {
    label: "Match service",
    value: "Operational",
    tone: "success",
  },
  {
    label: "Leaderboard cache",
    value: "Updated now",
    tone: "info",
  },
  {
    label: "Check-in window",
    value: "18:15 WAT",
    tone: "warning",
  },
  {
    label: "Dispute queue",
    value: "2 open",
    tone: "danger",
  },
  {
    label: "Crew service",
    value: "Operational",
    tone: "success",
  },
  {
    label: "Rewards ledger",
    value: "Synchronized",
    tone: "info",
  },
];

export default function AtmospherePreviewPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>M2 // GLOBAL ATMOSPHERE</p>

          <h1 className={styles.title}>DARK. COMPETITIVE. ELECTRIC.</h1>

          <p className={styles.description}>
            This route verifies the VERZUS global canvas, ambient lighting, technical grid, surface
            hierarchy, keyboard focus, selection, and scrollbar behavior.
          </p>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Surface hierarchy</h2>
            <span>Global foundation</span>
          </div>

          <div className={styles.surfaceGrid}>
            <article className={styles.canvasCard}>
              <span className={styles.cardCode}>SURFACE 0</span>
              <h3>Deep canvas</h3>
              <p>#080A0C application background.</p>
            </article>

            <article className={styles.baseCard}>
              <span className={styles.cardCode}>SURFACE 1</span>
              <h3>Base surface</h3>
              <p>#111519 cards, modules, and table rows.</p>
            </article>

            <article className={styles.elevatedCard}>
              <span className={styles.cardCode}>SURFACE 2</span>
              <h3>Elevated surface</h3>
              <p>#1A2026 hover, popover, and elevated content.</p>
            </article>

            <article className={styles.selectedCard}>
              <span className={styles.cardCode}>ACTIVE</span>
              <h3>Selected state</h3>
              <p>Green border, low-opacity fill, and restrained glow.</p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Keyboard and selection</h2>
            <span>Press Tab</span>
          </div>

          <p className={styles.selectionText}>
            Select this sentence with your cursor to verify the approved neon-green text-selection
            treatment.
          </p>

          <div className={styles.focusRow}>
            <a href="#operational-status">View operational status</a>

            <button type="button">Check focus state</button>

            <button data-focus-ring="secondary" type="button">
              Secondary focus
            </button>
          </div>
        </section>

        <section className={styles.section} id="operational-status">
          <div className={styles.sectionHeader}>
            <h2>Operational status</h2>
            <span>Scrollable region</span>
          </div>

          <div className={styles.scrollFrame}>
            {operationalRows.map((row) => (
              <article className={styles.statusRow} key={row.label}>
                <div>
                  <h3>{row.label}</h3>
                  <p>Independent service boundary</p>
                </div>

                <span
                  className={
                    row.tone === "success"
                      ? styles.success
                      : row.tone === "info"
                        ? styles.info
                        : row.tone === "warning"
                          ? styles.warning
                          : styles.danger
                  }
                >
                  {row.value}
                </span>
              </article>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <span>Canvas: #080A0C</span>
          <span>Primary: #00FF87</span>
          <span>Secondary: #00E5FF</span>
        </footer>
      </section>
    </main>
  );
}
