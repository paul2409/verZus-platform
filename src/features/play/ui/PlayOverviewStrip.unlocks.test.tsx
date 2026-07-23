import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { PlayerStatus } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayOverviewStrip } from "./PlayOverviewStrip";

const player: PlayerStatus = {
  playerId: "player-1",
  handle: "player",
  displayName: "Player",
  avatarUrl: null,
  primaryGame: "EA Sports FC",
  gameLane: "1v1",
  locationLabel: "Lagos",
  trustScore: 0,
  trustTier: "restricted",
  weekLabel: "Week 1",
  unreadNotifications: 0,
  lastUpdatedAt: "2026-07-23T12:00:00.000Z",
};

function view<T>(
  id: PlayWidgetView<T>["id"],
  data: T | null,
  state: PlayWidgetView<T>["state"],
): PlayWidgetView<T> {
  return {
    id,
    data,
    state,
    errorCode: null,
    requestId: null,
    available: true,
    stale: false,
  };
}

describe("PlayOverviewStrip locked statistics", () => {
  it("explains how empty header statistics unlock", () => {
    render(
      <PlayOverviewStrip
        currentPosition={view("current-position", null, "empty")}
        onRetryPlayer={vi.fn()}
        onRetryPosition={vi.fn()}
        playerStatus={view("player-status", player, "success")}
      />,
    );

    expect(screen.getByText("Play 1 match to reveal")).toBeVisible();
    expect(screen.getByText("Play 1 match to calculate")).toBeVisible();
    expect(screen.getByText("Win 1 match to start")).toBeVisible();
  });
});
