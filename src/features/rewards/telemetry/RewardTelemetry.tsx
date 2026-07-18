"use client";

// VERZUS M10.7 REWARD SURFACE AND RESOURCE TELEMETRY

import { useEffect, useRef } from "react";

import type { RewardResourceHealth, RewardResourceName } from "../resources";
import { recordRewardTelemetry } from "./reward-telemetry.client";

export function RewardSurfaceTelemetry() {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    recordRewardTelemetry({
      eventName: "rewards_surface_viewed",
      surface: "overview",
      resource: null,
      widget: null,
      rewardId: null,
      state: "viewed",
      errorCode: null,
      requestId: null,
    });
  }, []);

  return null;
}

export function RewardResourceTelemetry({
  health,
}: {
  health: Record<RewardResourceName, RewardResourceHealth>;
}) {
  const emitted = useRef(new Set<string>());

  useEffect(() => {
    for (const item of Object.values(health)) {
      if (!["error", "offline", "stale"].includes(item.state)) continue;
      const key = `${item.name}:${item.state}:${item.requestId ?? "none"}`;
      if (emitted.current.has(key)) continue;
      emitted.current.add(key);

      recordRewardTelemetry({
        eventName: item.state === "stale" ? "reward_resource_stale" : "reward_resource_failed",
        surface: "resource",
        resource: item.name,
        widget: null,
        rewardId: null,
        state: item.state,
        errorCode: item.code,
        requestId: item.requestId,
      });
    }
  }, [health]);

  return null;
}
