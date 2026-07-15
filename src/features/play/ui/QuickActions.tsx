// VERZUS M5 STEPS 5.5-5.8

import Link from "next/link";

import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

const actions = [
  {
    href: "/compete",
    label: "FIND MATCH",
    detail: "Ranked queue",
  },
  {
    href: "/compete",
    label: "COMPETE",
    detail: "Open events",
  },
  {
    href: "/leaderboards/weekly",
    label: "RANKINGS",
    detail: "Weekly table",
  },
  {
    href: "/crews",
    label: "CREW HQ",
    detail: "Team activity",
  },
] as const;

export function QuickActions() {
  return (
    <WidgetFrame eyebrow="06 · QUICK ACTIONS" title="Jump back in" status="ALWAYS AVAILABLE">
      <div className={styles.quickActionGrid}>
        {actions.map((action) => (
          <Link href={action.href} key={action.label}>
            <strong>{action.label}</strong>
            <span>{action.detail}</span>
          </Link>
        ))}
      </div>
    </WidgetFrame>
  );
}
