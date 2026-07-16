import Link from "next/link";

import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

const actions = [
  {
    href: "/compete",
    label: "FIND MATCH",
    detail: "Quick competitive queue",
    glyph: "▶",
    tone: "green",
  },
  {
    href: "/compete",
    label: "CREATE MATCH",
    detail: "Open a custom lobby",
    glyph: "+",
    tone: "cyan",
  },
  {
    href: "/crews",
    label: "JOIN CREW",
    detail: "Find compatible players",
    glyph: "◎",
    tone: "orange",
  },
  {
    href: "/leaderboards/weekly",
    label: "VIEW RANKINGS",
    detail: "Track weekly movement",
    glyph: "▥",
    tone: "purple",
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
