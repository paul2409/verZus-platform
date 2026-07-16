import Link from "next/link";

import styles from "./AppShell.module.css";

/** Combined V/Z monogram — reads as both letters at a glance. */
function VerzusMark() {
  return (
    <svg
      aria-hidden="true"
      className={styles.brandMarkSvg}
      fill="none"
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 6h10.5L20 16.5 23.5 6H34L22.5 28.5H34v5.5H6v-5.5h11.5L6 6Z"
        fill="url(#vz-mark-fill)"
      />
      <path
        d="M8.2 8.2 18.8 26.8h2.4L31.8 8.2h-3.6L20 22.2 11.8 8.2H8.2Z"
        fill="url(#vz-mark-core)"
        opacity="0.92"
      />
      <defs>
        <linearGradient id="vz-mark-fill" x1="6" x2="34" y1="6" y2="34">
          <stop stopColor="#00E5FF" />
          <stop offset="1" stopColor="#00FF87" />
        </linearGradient>
        <linearGradient id="vz-mark-core" x1="10" x2="30" y1="8" y2="28">
          <stop stopColor="#080A0C" />
          <stop offset="1" stopColor="#111519" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BrandMark() {
  return (
    <Link aria-label="VERZUS home" className={styles.brand} href="/play">
      <span aria-hidden="true" className={styles.brandGlyph}>
        <VerzusMark />
      </span>
      <span className={styles.brandWord}>VERZUS</span>
      <span aria-hidden="true" className={styles.brandVersion}>
        {"/" + "/ V.01"}
      </span>
    </Link>
  );
}
