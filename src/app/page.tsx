import { release } from "@/lib/config/release";

import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.panel} aria-labelledby="foundation-title">
        <p className={styles.eyebrow}>Milestone M1</p>
        <h1 className={styles.title} id="foundation-title">
          VERZUS foundation
        </h1>
        <p className={styles.description}>
          The clean repository, validation pipeline, environment contract, testing foundation, and
          deployment metadata are active. Product screens begin only after M1 approval.
        </p>
        <ul className={styles.statusList}>
          <li className={styles.statusItem}>
            <span>Environment</span>
            <strong className={styles.value}>{release.environment}</strong>
          </li>
          <li className={styles.statusItem}>
            <span>Release</span>
            <strong className={styles.value}>{release.sha}</strong>
          </li>
          <li className={styles.statusItem}>
            <span>Health endpoint</span>
            <strong className={styles.value}>/api/health</strong>
          </li>
        </ul>
      </section>
    </main>
  );
}
