"use client";

// VERZUS M10.4 REWARD CLAIM CONTEXT

import { createContext, type ReactNode, useContext } from "react";

import type { RewardClaimScenario } from "../model/reward-claim.types";
import { useRewardClaim, type RewardClaimController } from "../hooks/useRewardClaim";

const RewardClaimContext = createContext<RewardClaimController | null>(null);

export function RewardClaimProvider({
  inventoryVersion,
  scenario,
  children,
}: {
  inventoryVersion: number;
  scenario: RewardClaimScenario;
  children: ReactNode;
}) {
  const controller = useRewardClaim({ inventoryVersion, scenario });
  return <RewardClaimContext.Provider value={controller}>{children}</RewardClaimContext.Provider>;
}

export function useRewardClaimContext(): RewardClaimController {
  const context = useContext(RewardClaimContext);
  if (!context) {
    throw new Error("Reward claim controls require RewardClaimProvider.");
  }
  return context;
}
