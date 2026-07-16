import type { HTMLAttributes } from "react";

import styles from "./status-chip.module.css";

export type StatusChipTone = "live" | "scheduled" | "verified" | "locked";

export type StatusChipProps = HTMLAttributes<HTMLSpanElement> & {
  tone: StatusChipTone;
};

export function StatusChip({ tone, className, children, ...props }: StatusChipProps) {
  return (
    <span
      {...props}
      className={`${styles.chip} ${styles[tone]} ${className ?? ""}`}
      data-status-chip={tone}
    >
      {children}
    </span>
  );
}
