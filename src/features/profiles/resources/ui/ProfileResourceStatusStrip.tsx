// VERZUS M11.4 PROFILE RESOURCE HEALTH STRIP

"use client";

import type { ProfileResourceHealth, ProfileResourceName } from "../model/profile-resource.types";
import styles from "./ProfileResourceStatusStrip.module.css";

const labels: Record<ProfileResourceName, string> = {
  identity: "Identity",
  "competitive-summary": "Competitive summary",
  crew: "Crew",
  availability: "Availability",
};

export function ProfileResourceStatusStrip({
  health,
  onRetry,
}: {
  health: Record<ProfileResourceName, ProfileResourceHealth>;
  onRetry: (resource: ProfileResourceName) => void;
}) {
  const resources = Object.keys(health) as ProfileResourceName[];
  const hasIssue = resources.some((name) => !["success", "empty"].includes(health[name].state));

  if (!hasIssue) return null;

  return (
    <section aria-label="Profile resource status" className={styles.strip}>
      {resources.map((name) => {
        const item = health[name];
        if (item.state === "success") return null;
        return (
          <article className={styles.item} data-state={item.state} key={name}>
            <div>
              <strong>{labels[name]}</strong>
              <span>{item.state.replace("-", " ")}</span>
            </div>
            {item.message ? <p>{item.message}</p> : null}
            {item.requestId ? <code>{item.requestId}</code> : null}
            {item.retryable && item.state !== "retrying" ? (
              <button onClick={() => onRetry(name)} type="button">
                Retry
              </button>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
