// VERZUS M4 STEP 4.3

import styles from "./AuthScreens.module.css";

export interface AuthSecurityPanelProps {
  title?: string;
  copy?: string;
}

export function AuthSecurityPanel({
  title = "Your account is protected",
  copy = "Secure sessions protect your competitive identity, account data, and progress across VERZUS.",
}: AuthSecurityPanelProps) {
  return (
    <aside className={styles.securityPanel}>
      <span className={styles.securityIcon} aria-hidden="true">
        SEC
      </span>
      <div className={styles.securityContent}>
        <h2 className={styles.securityTitle}>{title}</h2>
        <p className={styles.securityCopy}>{copy}</p>
      </div>
    </aside>
  );
}
