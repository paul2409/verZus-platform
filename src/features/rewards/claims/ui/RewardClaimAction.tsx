"use client";

// VERZUS M10.4 CLAIM ACTION

import { Button } from "@/components/primitives/button";

import type { RewardState } from "../../foundation";
import { useRewardClaimContext } from "./RewardClaimContext";
import styles from "./RewardClaim.module.css";

export function RewardClaimAction({
  rewardId,
  state,
  compact = false,
}: {
  rewardId: string;
  state: RewardState;
  compact?: boolean;
}) {
  const claim = useRewardClaimContext();
  if (state !== "claimable") return null;

  const active = claim.activeRewardId === rewardId;
  const loading = active && claim.isPending;

  return (
    <Button
      className={compact ? styles.compactButton : styles.primaryButton}
      disabled={!claim.canClaim || (claim.isPending && !active)}
      fullWidth={!compact}
      loading={loading}
      loadingLabel="Claiming"
      onClick={() => claim.begin(rewardId)}
      size={compact ? "sm" : "md"}
      variant="primary"
    >
      {claim.canClaim ? "Claim" : "Checking"}
    </Button>
  );
}
