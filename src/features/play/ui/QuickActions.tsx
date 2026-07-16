// VERZUS STAGE 3 QUICK ACTIONS

import Link from "next/link";

import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

const actions = [
  {
    href: "/compete",
    label: "FIND MATCH",
    detail: "Open competitive queue",
    glyph: "▶",
    tone: "primary",
  },
  {
    href: "/leaderboards/weekly",
    label: "VIEW RANK",
    detail: "Track weekly movement",
    glyph: "#",
    tone: "info",
  },
  {
    href: "/crews",
    label: "CREW HQ",
    detail: "Check War Week status",
    glyph: "◎",
    tone: "war",
  },
  {
    href: "/compete",
    label: "VIEW RULES",
    detail: "Competition requirements",
    glyph: "i",
    tone: "neutral",
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
