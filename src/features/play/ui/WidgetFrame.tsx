import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./play-command-center.module.css";

export function WidgetFrame({
  eyebrow,
  title,
  status,
  statusHref,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  status?: string;
  statusHref?: string;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <section className={`${styles.widget} ${className ?? ""}`}>
      <header className={styles.widgetHeader}>
        <div>
          {eyebrow ? <span>{eyebrow}</span> : null}
          <h2>{title}</h2>
        </div>
        {status && statusHref ? (
          <Link href={statusHref}>{status}</Link>
        ) : status ? (
          <b>{status}</b>
        ) : null}
      </header>
      {children}
    </section>
  );
}
