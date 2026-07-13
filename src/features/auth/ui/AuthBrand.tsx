// VERZUS M4 STEP 4.3

import styles from "./AuthScreens.module.css";

export function AuthBrand() {
  return (
    <header className={styles.brand}>
      <span className={styles.brandMark} aria-hidden="true" />
      <p className={styles.brandName}>VERZUS</p>
      <p className={styles.brandTagline}>Compete. Rise. Earn.</p>
    </header>
  );
}
