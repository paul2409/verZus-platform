import type { ReactNode } from "react";

import styles from "./SystemStateScreen.module.css";

type SystemStateTone = "loading" | "error" | "not-found" | "maintenance";

type SystemStateScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  tone: SystemStateTone;
  action?: ReactNode;
  reference?: string;
};

export function SystemStateScreen({
  eyebrow,
  title,
  description,
  tone,
  action,
  reference,
}: SystemStateScreenProps) {
  return (
    <main className={styles.page} data-tone={tone}>
      <section className={styles.card}>
        <div aria-hidden="true" className={styles.signal} />
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.description}>{description}</p>
        {reference ? <p className={styles.reference}>Reference: {reference}</p> : null}
        {tone === "loading" ? (
          <div aria-hidden="true" className={styles.loadingBars}>
            <span />
            <span />
            <span />
          </div>
        ) : null}
        {action ? <div className={styles.action}>{action}</div> : null}
      </section>
    </main>
  );
}
