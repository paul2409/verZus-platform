import type { HTMLAttributes } from "react";

import styles from "./AppShell.module.css";

export type ContentGridProps = HTMLAttributes<HTMLDivElement> & {
  layout?: "single" | "two" | "three" | "dashboard";
};

const layoutClasses = {
  single: styles.gridSingle!,
  two: styles.gridTwo!,
  three: styles.gridThree!,
  dashboard: styles.gridDashboard!,
};

export function ContentGrid({ layout = "dashboard", className, ...props }: ContentGridProps) {
  return (
    <div
      {...props}
      className={[styles.contentGrid, layoutClasses[layout], className].filter(Boolean).join(" ")}
    />
  );
}
