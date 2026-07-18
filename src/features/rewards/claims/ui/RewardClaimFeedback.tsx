"use client";

// VERZUS M10.4 CLAIM SUCCESS AND FAILURE FEEDBACK

import { Button } from "@/components/primitives/button";

import { useRewardClaimContext } from "./RewardClaimContext";
import styles from "./RewardClaim.module.css";

export function RewardClaimFeedback() {
  const claim = useRewardClaimContext();

  if (claim.result) {
    return (
      <section aria-live="polite" className={styles.feedback} data-tone="success" role="status">
        <div>
          <strong>{claim.result.reward.title} claimed</strong>
          <p>
            Inventory confirmed · Reference {claim.result.claimReference}
            {claim.result.replayed ? " · Safe retry replayed" : ""}
          </p>
        </div>
        <Button onClick={claim.dismiss} size="sm" variant="ghost">
          Dismiss
        </Button>
      </section>
    );
  }

  if (!claim.error) return null;

  const stale = claim.error.code === "REWARD_INVENTORY_STALE_VERSION";

  return (
    <section aria-live="assertive" className={styles.feedback} data-tone="error" role="alert">
      <div>
        <strong>Claim not confirmed</strong>
        <p>{claim.error.message}</p>
        <small>Request {claim.error.requestId}</small>
      </div>
      <div className={styles.feedbackActions}>
        {stale ? (
          <Button onClick={claim.refreshAndReset} size="sm" variant="secondary">
            Refresh rewards
          </Button>
        ) : claim.error.retryable ? (
          <Button onClick={claim.retry} size="sm" variant="secondary">
            Retry safely
          </Button>
        ) : null}
        <Button onClick={claim.dismiss} size="sm" variant="ghost">
          Dismiss
        </Button>
      </div>
    </section>
  );
}
