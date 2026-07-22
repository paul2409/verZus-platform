import Link from "next/link";

import styles from "./play-command-center.module.css";

export function PlayStatusFooter({ online, degraded }: { online: boolean; degraded: boolean }) {
  return (
    <footer className={styles.playStatusFooter}>
      <div>
        <span data-online={online} aria-hidden="true" />
        <small>STATUS</small>
        <strong>
          {online ? (degraded ? "Partially Available" : "All Systems Operational") : "Offline"}
        </strong>
      </div>
      <div>
        <span aria-hidden="true">▣</span>
        <small>DATA</small>
        <strong>Server-authoritative</strong>
      </div>
      <div>
        <span aria-hidden="true">↗</span>
        <small>SUPPORT</small>
        <Link href="/settings">Help & settings</Link>
      </div>
    </footer>
  );
}
