// VERZUS M4 STEP 4.3

import type { ReactNode } from "react";

import { AuthBrand } from "./AuthBrand";
import styles from "./AuthScreens.module.css";

export type AuthAccent = "secure" | "info" | "warning" | "danger";

export interface AuthFrameProps {
  children: ReactNode;
  accent?: AuthAccent;
  statusLabel: string;
  statusDetail: string;
  eyebrow?: string;
  title: string;
  description: string;
}

export function AuthFrame({
  children,
  accent = "secure",
  statusLabel,
  statusDetail,
  eyebrow = "Season Zero access",
  title,
  description,
}: AuthFrameProps) {
  return (
    <div className={styles.shell} data-accent={accent === "secure" ? undefined : accent}>
      <div className={styles.viewport}>
        <aside className={styles.atmosphere} aria-label="VERZUS identity">
          <div className={styles.atmosphereContent}>
            <p className={styles.atmosphereKicker}>Secure competitive access</p>
            <h2 className={styles.atmosphereTitle}>Enter through identity. Compete with proof.</h2>
            <p className={styles.atmosphereCopy}>
              Authentication protects player identity, verified game accounts, match eligibility,
              Crew membership, rewards, and trust history.
            </p>
            <div className={styles.atmosphereSignals} aria-label="Security signals">
              <span className={styles.atmosphereSignal}>Identity</span>
              <span className={styles.atmosphereSignal}>Session</span>
              <span className={styles.atmosphereSignal}>Trust</span>
            </div>
          </div>
        </aside>

        <div className={styles.contentColumn}>
          <AuthBrand />

          <div className={styles.statusStrip}>
            <span>{statusLabel}</span>
            <span className={styles.statusDivider} aria-hidden="true" />
            <span className={styles.statusDetail}>{statusDetail}</span>
          </div>

          <main className={styles.main}>
            <header className={styles.introduction}>
              <p className={styles.eyebrow}>{eyebrow}</p>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.description}>{description}</p>
            </header>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
