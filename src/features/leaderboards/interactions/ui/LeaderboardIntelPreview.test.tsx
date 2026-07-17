// VERZUS M8.10 INTEL DRAWER RELIABILITY TESTS

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { leaderboardFoundationBoards } from "../../foundation/mocks/leaderboard-foundation.mock";
import { LeaderboardIntelPreview } from "./LeaderboardIntelPreview";

const { replace, recordTelemetry } = vi.hoisted(() => ({
  replace: vi.fn(),
  recordTelemetry: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/leaderboards/weekly",
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams("mode=weekly&intel=player&entityId=player-prismo"),
}));

vi.mock("../../telemetry", () => ({
  recordLeaderboardIntelTelemetry: recordTelemetry,
}));

vi.mock("./LeaderboardIntelResourceCard", () => ({
  LeaderboardIntelResourceCard: ({
    selection,
  }: {
    selection: { kind: string; entityId: string };
  }) => <div data-testid="resource-card">{`${selection.kind}:${selection.entityId}`}</div>,
}));

describe("LeaderboardIntelPreview", () => {
  beforeEach(() => {
    replace.mockClear();
    recordTelemetry.mockClear();
  });

  it("opens the API-backed card host for a ranked entity and focuses close", () => {
    render(
      <LeaderboardIntelPreview
        rows={leaderboardFoundationBoards.weekly.rows}
        selection={{ kind: "player", entityId: "player-prismo" }}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Prismo" })).toBeVisible();
    expect(screen.getByTestId("resource-card")).toHaveTextContent("player:player-prismo");
    expect(screen.getAllByRole("button", { name: "Close intel card" })[1]).toHaveFocus();
  });

  it("supports a deep-linked entity that is not on the current page", () => {
    render(
      <LeaderboardIntelPreview rows={[]} selection={{ kind: "crew", entityId: "crew-xenon" }} />,
    );

    expect(screen.getByRole("dialog", { name: "crew-xenon" })).toBeVisible();
    expect(screen.getByTestId("resource-card")).toHaveTextContent("crew:crew-xenon");
  });

  it("closes with Escape without destroying existing leaderboard query state", () => {
    render(
      <LeaderboardIntelPreview
        rows={leaderboardFoundationBoards.weekly.rows}
        selection={{ kind: "player", entityId: "player-prismo" }}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(replace).toHaveBeenCalledWith("/leaderboards/weekly?mode=weekly", { scroll: false });
  });
});
