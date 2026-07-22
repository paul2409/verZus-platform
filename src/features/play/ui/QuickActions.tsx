import Link from "next/link";

import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

const actions = [
  {
    href: "/compete",
    label: "COMPETITIONS",
    detail: "Browse and enter eligible events",
    glyph: "▶",
    tone: "primary",
  },
  {
    href: "/matches",
    label: "MY MATCHES",
    detail: "Open scheduled and active matches",
    glyph: "◎",
    tone: "info",
  },
  {
    href: "/leaderboards/weekly",
    label: "WEEKLY RANK",
    detail: "Track confirmed movement",
    glyph: "#",
    tone: "neutral",
  },
  {
    href: "/crews",
    label: "CREW HQ",
    detail: "Membership, roster, and operations",
    glyph: "◇",
    tone: "war",
  },
] as const;

export function QuickActions() {
  return (
    <WidgetFrame eyebrow="QUICK ACTIONS" title="Choose your next move" status="READY">
      <div className={styles.quickActionGrid}>
        {actions.map((action) => (
          <Link data-tone={action.tone} href={action.href} key={action.label}>
            <span className={styles.quickActionGlyph} aria-hidden="true">
              {action.glyph}
            </span>
            <span>
              <strong>{action.label}</strong>
              <small>{action.detail}</small>
            </span>
          </Link>
        ))}
      </div>
    </WidgetFrame>
  );
}
