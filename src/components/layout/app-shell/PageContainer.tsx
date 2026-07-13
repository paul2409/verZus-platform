import type { HTMLAttributes } from "react";

import styles from "./AppShell.module.css";

export type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  width?: "content" | "wide" | "full";
};

const widthClasses = {
  content: styles.pageWidthContent!,
  wide: styles.pageWidthWide!,
  full: styles.pageWidthFull!,
};

export function PageContainer({ width = "wide", className, ...props }: PageContainerProps) {
  return (
    <div
      {...props}
      className={[styles.pageContainer, widthClasses[width], className].filter(Boolean).join(" ")}
    />
  );
}
