// VERZUS M5 STEPS 5.9-5.13

import type { Metadata } from "next";
import Link from "next/link";

import { playScreenVariants } from "@/features/play/contracts";

import styles from "./review.module.css";

export const metadata: Metadata = {
  title: "M5 Play Review | VERZUS",
  robots: { index: false, follow: false },
};

const widths = [360, 390, 430, 768, 1024, 1440] as const;

export default function M5PlayReviewPage() {
  return (
    <main className={styles.page}>
      <header>
        <span>MILESTONE 5 · REVIEW HUB</span>
        <h1>Play Command Centre</h1>
        <p>
          Inspect every approved state, verify the six supported widths, and confirm that failed
          widgets remain isolated.
        </p>
      </header>

      <section className={styles.statusGrid}>
        <article>
          <span>SCREEN STATES</span>
          <strong>10</strong>
        </article>
        <article>
          <span>VIEWPORTS</span>
          <strong>6</strong>
        </article>
        <article>
          <span>READ ENDPOINTS</span>
          <strong>7</strong>
        </article>
        <article>
          <span>MUTATIONS</span>
          <strong>1</strong>
        </article>
      </section>

      <section className={styles.widths}>
        <h2>Required viewport audit</h2>
        <div>
          {widths.map((width) => (
            <span key={width}>{width}px</span>
          ))}
        </div>
      </section>

      <section className={styles.scenarios}>
        {playScreenVariants.map((scenario, index) => (
          <article key={scenario}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{scenario.replaceAll("_", " ")}</strong>
              <small>/play?scenario={scenario}</small>
            </div>
            <Link href={`/play?scenario=${scenario}`}>OPEN STATE</Link>
          </article>
        ))}
      </section>

      <section className={styles.gate}>
        <strong>COMPLETION GATE</strong>
        <p>
          Run <code>npm run m5:visual:update</code> once, review the snapshots, then run{" "}
          <code>npm run m5:verify</code>.
        </p>
      </section>
    </main>
  );
}
