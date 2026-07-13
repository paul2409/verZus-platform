// VERZUS M4 STEP 4.3

import { AuthFrame } from "./AuthFrame";
import styles from "./AuthScreens.module.css";

export function AuthLoadingState() {
  return (
    <AuthFrame
      description="Preparing secure access."
      statusDetail="Initializing"
      statusLabel="Secure entry"
      title="Loading authentication"
    >
      <section
        aria-busy="true"
        aria-label="Loading authentication screen"
        className={styles.loadingPanel}
        role="status"
      >
        <span className={styles.loadingLine} />
        <span className={styles.loadingLine} />
        <span className={styles.loadingLine} />
        <span className={styles.loadingLine} />
      </section>
    </AuthFrame>
  );
}
