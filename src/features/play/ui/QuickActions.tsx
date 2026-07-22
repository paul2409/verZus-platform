import Link from "next/link";

import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

const actions = [
  {
    href: "/compete",
    label: "FIND MATCH",
    detail: "Enter an eligible competition",
    glyph: "◎",
    tone: "cyan",
  },
  {
    href: "/matches",
    label: "MY MATCHES",
    detail: "Open your active schedule",
    glyph: "▣",
    tone: "violet",
  },
  {
    href: "/crews",
    label: "JOIN CREW",
    detail: "Find your competitive unit",
    glyph: "C",
    tone: "violet",
  },
  {
    href: "/leaderboards/weekly",
    label: "WEEKLY RANK",
    detail: "Track confirmed movement",
    glyph: "#",
    tone: "magenta",
  },
] as const;

export function QuickActions() {
  return (
    <WidgetFrame title="QUICK ACTIONS" className={styles.quickActionsWidget}>
      <div className={styles.quickActionList}>
        {actions.map((action) => (
          <Link data-tone={action.tone} href={action.href} key={action.label}>
            <span className={styles.quickActionIcon} aria-hidden="true">
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
