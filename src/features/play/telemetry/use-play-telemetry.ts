// VERZUS M5 STEPS 5.9-5.13

"use client";

import { useEffect, useMemo } from "react";

import type { PlayCommandCenterViewModel } from "../view-model";
import { recordPlayTelemetry } from "./play-telemetry";

export function usePlayCommandCenterTelemetry(viewModel: PlayCommandCenterViewModel): void {
  const failureSignature = useMemo(
    () =>
      [
        viewModel.playerStatus,
        viewModel.nextMatch,
        viewModel.currentCheckIn,
        viewModel.currentPosition,
        viewModel.crewSummary,
        viewModel.recommendedCompetitions,
        viewModel.recentActivity,
      ]
        .filter((widget) => !widget.available)
        .map(
          (widget) =>
            `${widget.id}:${widget.errorCode ?? widget.state}:${widget.requestId ?? "none"}`,
        )
        .join("|"),
    [viewModel],
  );

  useEffect(() => {
    recordPlayTelemetry("play.screen.viewed", {
      route: "/play",
      scenario: viewModel.variant,
    });
  }, [viewModel.variant]);

  useEffect(() => {
    if (!failureSignature) {
      return;
    }

    for (const widget of [
      viewModel.playerStatus,
      viewModel.nextMatch,
      viewModel.currentCheckIn,
      viewModel.currentPosition,
      viewModel.crewSummary,
      viewModel.recommendedCompetitions,
      viewModel.recentActivity,
    ]) {
      if (!widget.available) {
        recordPlayTelemetry("play.widget.unavailable", {
          route: "/play",
          scenario: viewModel.variant,
          widget: widget.id,
          requestId: widget.requestId,
          errorCode: widget.errorCode,
        });
      }
    }
  }, [failureSignature, viewModel]);
}
