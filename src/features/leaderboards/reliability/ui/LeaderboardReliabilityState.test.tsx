// VERZUS M8.6 LEADERBOARD RELIABILITY UI TESTS

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { LeaderboardReliabilityView } from "../model/leaderboard-reliability.types";
import {
  LeaderboardReliabilityBanner,
  LeaderboardResourceStateCard,
} from "./LeaderboardReliabilityState";

const resource = {
  resource: "entries" as const,
  state: "error" as const,
  hasData: false,
  isFetching: false,
  retryable: true,
  message: "Rankings failed to load.",
  requestId: "req-rankings-1",
};

const view: LeaderboardReliabilityView = {
  intent: "error",
  target: "entries",
  overall: "partial-failure",
  resources: {
    composition: { ...resource, resource: "composition", state: "ready", retryable: false },
    summary: { ...resource, resource: "summary", state: "ready", retryable: false },
    entries: resource,
    "current-position": {
      ...resource,
      resource: "current-position",
      state: "ready",
      retryable: false,
    },
    rewards: { ...resource, resource: "rewards", state: "ready", retryable: false },
    status: { ...resource, resource: "status", state: "ready", retryable: false },
  },
  isolatedRowCount: 0,
  isolatedRowIds: [],
  retryable: true,
};

describe("leaderboard reliability UI", () => {
  it("shows partial failure without hiding available sections", () => {
    const retry = vi.fn();
    render(<LeaderboardReliabilityBanner onRetry={retry} view={view} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Some leaderboard resources are unavailable",
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry unavailable resources" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("shows request IDs and loading skeletons at resource scope", () => {
    const { rerender } = render(<LeaderboardResourceStateCard health={resource} />);
    expect(screen.getByText("Error ID: req-rankings-1")).toBeVisible();

    rerender(
      <LeaderboardResourceStateCard
        health={{
          ...resource,
          state: "loading",
          retryable: false,
          message: null,
          requestId: null,
        }}
      />,
    );
    expect(screen.getByLabelText("Loading ranking entries")).toBeVisible();
  });
});
