// VERZUS M7.8 MATCH OPERATIONS TELEMETRY BRIDGE

"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackMatchEvent } from "./match-telemetry.client";

export type MatchTelemetryBridgeProps = {
  environment: string;
  release: string;
};

function getMatchId(pathname: string): string | undefined {
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] === "matches" && segments.length > 1 ? segments[1] : undefined;
}

export function MatchTelemetryBridge({ environment, release }: MatchTelemetryBridgeProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = searchParams.get("state") ?? undefined;
  const resource = searchParams.get("resource") ?? undefined;
  const scenario = searchParams.get("scenario") ?? undefined;

  useEffect(() => {
    const base = {
      route: pathname,
      matchId: getMatchId(pathname),
      state,
      resource,
      scenario,
      environment,
      release,
    };

    trackMatchEvent({ name: "match.route_viewed", ...base });

    const root = document.querySelector<HTMLElement>("[data-match-operation-state]");
    if (root?.dataset.matchOperationState) {
      trackMatchEvent({
        name: "match.state_viewed",
        ...base,
        state: root.dataset.matchOperationState,
      });
    }

    const handleClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>(
        "button, a, [role='button']",
      );
      if (!target) return;
      const label = (target.getAttribute("aria-label") ?? target.textContent ?? "")
        .trim()
        .toLowerCase();

      if (label.includes("retry")) {
        trackMatchEvent({ name: "match.retry_requested", ...base });
      } else if (label.includes("check in")) {
        trackMatchEvent({ name: "match.check_in_started", ...base });
      } else if (label.includes("lobby") || label.includes("start match")) {
        trackMatchEvent({ name: "match.lobby_action_started", ...base });
      } else if (label.includes("result") || label.includes("confirm score")) {
        trackMatchEvent({ name: "match.result_action_started", ...base });
      } else if (label.includes("dispute")) {
        trackMatchEvent({ name: "match.dispute_started", ...base });
      } else if (
        label.includes("forfeit") ||
        label.includes("cancel match") ||
        label.includes("complete match")
      ) {
        trackMatchEvent({ name: "match.terminal_action_started", ...base });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [environment, pathname, release, resource, scenario, state]);

  return null;
}
