"use client";

// VERZUS M10.3 FAILURE-ISOLATED REWARD RESOURCE STATUS
// VERZUS M10.7 RETRYING, AUTHORIZATION AND MAINTENANCE STATES

import type { RewardResourceHealth, RewardResourceName } from "../model/reward-resource.types";
import styles from "./RewardResourceStatusStrip.module.css";

const resourceLabels: Record<RewardResourceName, string> = {
  progress: "Progress",
  season: "Season",
  inventory: "Inventory",
  history: "History",
  achievements: "Achievements",
};

function fallbackMessage(item: RewardResourceHealth): string {
  switch (item.state) {
    case "stale":
      return "Showing the last confirmed snapshot.";
    case "empty":
      return "No confirmed items are available.";
    case "retrying":
      return "Retrying without clearing confirmed reward data.";
    case "unauthorized":
      return "Sign in again to refresh this reward resource.";
    case "forbidden":
      return "Your account cannot access this reward resource.";
    case "not-found":
      return "This reward resource could not be found.";
    case "maintenance":
      return "This reward resource is temporarily under maintenance.";
    default:
      return "Refreshing this reward resource.";
  }
}

export function RewardResourceStatusStrip({
  health,
  onRetry,
}: {
  health: Record<RewardResourceName, RewardResourceHealth>;
  onRetry: (resource: RewardResourceName) => void;
}) {
  const visible = Object.values(health).filter((item) => item.state !== "success");
  if (visible.length === 0) return null;

  return (
    <section aria-label="Reward data status" className={styles.statusStrip}>
      {visible.map((item) => (
        <article data-state={item.state} key={item.name}>
          <div>
            <strong>{resourceLabels[item.name]}</strong>
            <span>{item.state}</span>
          </div>
          <p>{item.message ?? fallbackMessage(item)}</p>
          {item.requestId ? <small>Request {item.requestId}</small> : null}
          {item.retryable && ["error", "offline", "maintenance"].includes(item.state) ? (
            <button onClick={() => onRetry(item.name)} type="button">
              Retry {resourceLabels[item.name]}
            </button>
          ) : null}
        </article>
      ))}
    </section>
  );
}
