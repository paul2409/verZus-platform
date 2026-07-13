import Link from "next/link";

import styles from "./PlatformRoute.module.css";
import type { PlatformBreadcrumb } from "./platform-route";

export type BreadcrumbsProps = {
  items: readonly PlatformBreadcrumb[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.breadcrumbList}>
        <li>
          <Link href="/play">Home</Link>
        </li>
        {items.map((item, index) => {
          const current = index === items.length - 1;

          return (
            <li aria-current={current ? "page" : undefined} key={`${item.label}-${index}`}>
              <span aria-hidden="true" className={styles.breadcrumbSeparator}>
                /
              </span>
              {!current && item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
