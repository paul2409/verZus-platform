import Link from "next/link";

import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

const modes = [
  { href: "/compete", title: "RANKED", detail: "Compete and climb", mark: "R", tone: "green" },
  {
    href: "/crews",
    title: "CREW BATTLES",
    detail: "Unite and dominate",
    mark: "C",
    tone: "violet",
  },
  {
    href: "/compete",
    title: "TOURNAMENTS",
    detail: "High-stakes brackets",
    mark: "T",
    tone: "gold",
  },
  { href: "/matches", title: "MATCH ROOM", detail: "Open your schedule", mark: "M", tone: "cyan" },
] as const;

export function PlayModesPanel() {
  return (
    <WidgetFrame
      title="PLAY MODES"
      eyebrow="CHOOSE YOUR BATTLEFIELD"
      status="VIEW ALL"
      statusHref="/compete"
      className={styles.playModesWidget}
    >
      <div className={styles.playModeGrid}>
        {modes.map((mode) => (
          <Link data-tone={mode.tone} href={mode.href} key={mode.title}>
            <strong>{mode.title}</strong>
            <small>{mode.detail}</small>
            <span aria-hidden="true">{mode.mark}</span>
          </Link>
        ))}
      </div>
    </WidgetFrame>
  );
}
