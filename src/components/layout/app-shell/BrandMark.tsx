import Link from "next/link";

import styles from "./AppShell.module.css";

export function BrandMark() {
  return (
    <Link aria-label="VERZUS home" className={styles.brand} href="/play">
      <span aria-hidden="true" className={styles.brandGlyph}>
        V
      </span>
      <span className={styles.brandWord}>VERZUS</span>
      <span aria-hidden="true" className={styles.brandVersion}>
        {"/" + "/ V.01"}
      </span>
    </Link>
  );
}
