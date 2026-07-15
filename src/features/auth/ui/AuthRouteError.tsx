// VERZUS M4 STEP 4.3
"use client";

import Link from "next/link";
import { AuthFrame } from "./AuthFrame";
import styles from "./AuthScreens.module.css";

export interface AuthRouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function AuthRouteError({ error, reset }: AuthRouteErrorProps) {
  return (
    <AuthFrame
      accent="danger"
      description="The authentication screen failed independently. No credentials were submitted."
      statusDetail="Controlled failure"
      statusLabel="Authentication unavailable"
      title="Secure entry interrupted"
    >
      <section className={styles.statePanel} role="alert">
        <div className={styles.stateHeader}>
          <span className={styles.stateIcon} aria-hidden="true">
            ERR
          </span>
          <div className={styles.stateContent}>
            <h2 className={styles.noticeTitle}>Try this screen again</h2>
            <p className={styles.noticeCopy}>Reference: {error.digest ?? "M4-AUTH-ROUTE"}</p>
          </div>
        </div>

        <button className={styles.primaryAction} onClick={reset} type="button">
          Retry screen
        </button>
        <Link className={styles.secondaryButton} href="/">
          Return home
        </Link>
      </section>
    </AuthFrame>
  );
}
