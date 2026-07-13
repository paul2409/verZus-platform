// VERZUS M4 STEP 4.3

import { AuthFrame } from "./AuthFrame";
import styles from "./AuthScreens.module.css";

export function AuthNotFound() {
  return (
    <AuthFrame
      accent="info"
      description="The requested authentication destination does not exist."
      statusDetail="Route not found"
      statusLabel="Secure access"
      title="Authentication route unavailable"
    >
      <section className={styles.statePanel}>
        <div className={styles.stateHeader}>
          <span className={styles.stateIcon} aria-hidden="true">
            404
          </span>
          <div className={styles.stateContent}>
            <h2 className={styles.noticeTitle}>Choose a safe destination</h2>
            <p className={styles.noticeCopy}>Return to sign in or create a new player account.</p>
          </div>
        </div>

        <a className={styles.primaryAction} href="/login">
          Go to sign in
        </a>
        <a className={styles.secondaryButton} href="/register">
          Create account
        </a>
      </section>
    </AuthFrame>
  );
}
