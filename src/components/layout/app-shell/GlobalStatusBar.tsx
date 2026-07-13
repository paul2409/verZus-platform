import { Icon } from "@/components/primitives/icon";

import styles from "./AppShell.module.css";
import type { GlobalShellStatus } from "./shell.types";

export type GlobalStatusBarProps = GlobalShellStatus & {
  compact?: boolean;
};

const statusIcons = {
  operational: "check",
  degraded: "alert-triangle",
  offline: "link",
  maintenance: "settings",
} as const;

export function GlobalStatusBar({ kind, label, detail, compact = false }: GlobalStatusBarProps) {
  const alert = kind === "offline" || kind === "maintenance";

  return (
    <section
      className={compact ? styles.globalStatusCompact : styles.globalStatus}
      data-shell-status={kind}
      role={alert ? "alert" : "status"}
    >
      <Icon decorative name={statusIcons[kind]} size="sm" />
      <strong>{label}</strong>
      {detail ? <span>{detail}</span> : null}
    </section>
  );
}
