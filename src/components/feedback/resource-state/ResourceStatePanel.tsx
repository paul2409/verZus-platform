// VERZUS M12.6 DOMAIN-NEUTRAL RESOURCE STATE PANEL

import Link from "next/link";

import type { ResourceFailureDescriptor } from "@/lib/reliability/resource-reliability";

import styles from "./ResourceStatePanel.module.css";

export function ResourceStatePanel({
  descriptor,
  onRetry,
  retryLabel = "Retry resource",
  secondaryHref,
  secondaryLabel,
}: {
  descriptor: ResourceFailureDescriptor;
  onRetry?: (() => void) | undefined;
  retryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section
      className={styles.panel}
      data-resource-state={descriptor.state}
      role="alert"
    >
      <div className={styles.statusLine}>
        <span aria-hidden="true" className={styles.signal} />
        <p>{descriptor.eyebrow}</p>
      </div>
      <h2>{descriptor.title}</h2>
      <p className={styles.message}>{descriptor.message}</p>
      <div className={styles.actions}>
        {descriptor.retryable && onRetry ? (
          <button onClick={onRetry} type="button">{retryLabel}</button>
        ) : null}
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        ) : null}
      </div>
      {descriptor.requestId ? (
        <small>Support reference: <code>{descriptor.requestId}</code></small>
      ) : null}
    </section>
  );
}
