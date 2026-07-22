// VERZUS M6.7 COMPETITION TELEMETRY

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { trackCompetitionEvent } from "./competition-telemetry.client";

export type CompetitionTelemetryBridgeProps = {
  environment: string;
  release: string;
};

function getCompetitionId(pathname: string): string | undefined {
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] === "compete" && segments.length > 1 ? segments[1] : undefined;
}

export function CompetitionTelemetryBridge({
  environment,
  release,
}: CompetitionTelemetryBridgeProps) {
  const pathname = usePathname();

  useEffect(() => {
    const base = {
      route: pathname,
      competitionId: getCompetitionId(pathname),
      environment,
      release,
    };

    trackCompetitionEvent({ name: "competition.route_viewed", ...base });

    const seen = new Set<string>();
    const recordLifecycle = () => {
      document.querySelectorAll<HTMLElement>("[data-lifecycle-state]").forEach((element) => {
        const state = element.dataset.lifecycleState;
        if (!state || seen.has(state)) return;
        seen.add(state);
        trackCompetitionEvent({
          name: "competition.lifecycle_viewed",
          code: state,
          requestId: element.dataset.requestId,
          ...base,
        });
      });
    };

    recordLifecycle();
    const observer = new MutationObserver(recordLifecycle);
    observer.observe(document.body, { childList: true, subtree: true });

    const handleClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>(
        "button, a, [role='button']",
      );
      if (!target) return;
      const label = (target.getAttribute("aria-label") ?? target.textContent ?? "")
        .trim()
        .toLowerCase();

      if (label.includes("retry")) {
        trackCompetitionEvent({
          name: "competition.retry_requested",
          ...base,
        });
      } else if (label.includes("enter") || label.includes("confirm entry")) {
        trackCompetitionEvent({
          name: "competition.entry_started",
          ...base,
        });
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClick);
    };
  }, [environment, pathname, release]);

  return null;
}
