// VERZUS M6.7 COMPETITION REVIEW HUB

import type { Metadata } from "next";
import Link from "next/link";

import styles from "./review.module.css";

export const metadata: Metadata = {
  title: "M6 Competition Review | VERZUS",
  robots: { index: false, follow: false },
};

const scenarios = [
  "normal",
  "registration_closed",
  "waitlist",
  "not_eligible",
  "full_capacity",
  "cancelled",
  "offline",
  "partial_failure",
  "unauthorized",
  "forbidden",
  "not_found",
  "maintenance",
] as const;

export default function M6CompetitionReviewPage() {
  return (
    <main className={styles.page}>
      <header>
        <span>MILESTONE 6 · RELEASE REVIEW</span>
        <h1>COMPETITION OPERATIONS</h1>
        <p>
          Review discovery, detail, entry, lifecycle and degraded states before approving the M6
          immutable release artifact.
        </p>
      </header>

      <section className={styles.metrics} aria-label="M6 release scope">
        <article>
          <span>STAGES</span>
          <strong>7</strong>
        </article>
        <article>
          <span>VIEWPORTS</span>
          <strong>3</strong>
        </article>
        <article>
          <span>LIFECYCLE STATES</span>
          <strong>12</strong>
        </article>
        <article>
          <span>RELEASE</span>
          <strong>6.7</strong>
        </article>
      </section>

      <section className={styles.widths}>
        <h2>VISUAL BASELINES</h2>
        <div>
          <span>390px</span>
          <span>768px</span>
          <span>1440px</span>
        </div>
      </section>

      <section className={styles.scenarios} aria-labelledby="scenario-heading">
        <h2 id="scenario-heading">LIFECYCLE AND FAILURE INJECTION</h2>
        {scenarios.map((scenario, index) => (
          <article key={scenario}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <code>{scenario}</code>
            <Link href={`/compete/ea-fc-rookie-cup?scenario=${scenario}`}>OPEN STATE</Link>
          </article>
        ))}
      </section>

      <section className={styles.gate}>
        <h2>COMPLETION ORDER</h2>
        <p>
          <code>npm run m6:visual:update</code>
        </p>
        <p>
          <code>npm run m6:approve</code>
        </p>
        <p>
          <code>npm run verify:m6:6.7</code>
        </p>
        <p>
          <code>npm run m6:release</code>
        </p>
      </section>
    </main>
  );
}
