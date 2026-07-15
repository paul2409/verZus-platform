// VERZUS M5 STEPS 5.9-5.13

import styles from "./play-command-center.module.css";

export function PlayDisabledState() {
  return (
    <section className={styles.playDisabled} role="status">
      <span>PLAY COMMAND CENTRE</span>
      <h1>Temporarily unavailable</h1>
      <p>
        The Play feature flag is disabled for this release. Authentication, navigation, and account
        access remain available.
      </p>
    </section>
  );
}
