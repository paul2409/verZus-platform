import type { ReactNode } from "react";

import styles from "./AppShell.module.css";

export type PageHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      {breadcrumbs ? <div className={styles.breadcrumbs}>{breadcrumbs}</div> : null}
      <div className={styles.pageHeaderRow}>
        <div className={styles.pageHeaderCopy}>
          {eyebrow ? <p className={styles.pageEyebrow}>{eyebrow}</p> : null}
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className={styles.pageHeaderActions}>{actions}</div> : null}
      </div>
    </header>
  );
}
