// VERZUS STAGE 3 WIDGET FRAME

import type { ReactNode } from "react";

import styles from "./play-command-center.module.css";

export function WidgetFrame({
  eyebrow,
  title,
  status,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  status?: string;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <section className={`${styles.widget} ${className ?? ""}`}>
      <header className={styles.widgetHeader}>
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        {status ? <b>{status}</b> : null}
      </header>
      {children}
    </section>
  );
}
