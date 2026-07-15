// VERZUS M5 STEPS 5.5-5.8

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CrewSummary, CurrentPosition } from "../model";
import type { PlayWidgetView } from "../view-model";
import { CrewPulseWidget } from "./CrewPulseWidget";
import { CurrentPositionWidget } from "./CurrentPositionWidget";

const position: CurrentPosition = {
  leaderboardId: "weekly-14",
  weekLabel: "Week 14",
  rank: 17,
  previousRank: 21,
  movement: "up",
  points: 2310,
  targetPoints: 2500,
  wins: 24,
  losses: 7,
  winRate: 77.4,
  streak: "W7",
  tier: "Elite",
  lastUpdatedAt: "2026-07-15T18:00:00.000Z",
};

function view<T>(
  id: PlayWidgetView<T>["id"],
  data: T | null,
  state: PlayWidgetView<T>["state"] = "success",
): PlayWidgetView<T> {
  return {
    id,
    state,
    data,
    errorCode: null,
    requestId: null,
    available: true,
    stale: state === "stale",
  };
}

describe("Play widgets", () => {
  it("renders the current weekly position without hiding its navigation", () => {
    render(<CurrentPositionWidget view={view("current-position", position)} onRetry={vi.fn()} />);

    expect(screen.getByText("2,310")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "VIEW STANDINGS",
      }),
    ).toHaveAttribute("href", "/leaderboards/weekly");
  });

  it("renders an intentional no-Crew state", () => {
    render(
      <CrewPulseWidget view={view<CrewSummary>("crew-pulse", null, "empty")} onRetry={vi.fn()} />,
    );

    expect(screen.getByText("NO CREW YET")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "EXPLORE CREWS",
      }),
    ).toHaveAttribute("href", "/crews");
  });
});
