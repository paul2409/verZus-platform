// VERZUS M7.5 LOBBY OPERATIONS PANEL TESTS

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createMatchClockSnapshot } from "../model/match-clock.policy";
import { LobbyOperationsPanel } from "./LobbyOperationsPanel";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock("../api/match-lobby.mutation", () => ({
  useMatchLobbyMutation: () => ({
    mutate,
    isPending: false,
    data: null,
    error: null,
  }),
}));

const now = new Date("2026-07-16T20:00:00.000Z");
const clock = createMatchClockSnapshot("m7-preview", "lobby-open", now, 12);

const value = {
  visible: true,
  stateTone: "success" as const,
  title: "Lobby is open",
  description: "Join the private match lobby.",
  lobbyCode: "VZ-775-2049",
  connectionStatus: "connected" as const,
  platform: "EA SPORTS FC 26",
  serverRegion: "West Africa",
  joinInstructions: "Private match code",
  currentUserEntered: true,
  currentUserReady: false,
  opponentEntered: false,
  opponentReady: false,
  canEnter: false,
  canConfirmReady: true,
  canStartMatch: false,
  canReportIssue: true,
  issueCount: 0,
  lastIssueId: null,
  timerLabel: "00H 07M 48S",
  timerCaption: "Match starts",
  primaryAction: null,
  secondaryAction: null,
};

describe("LobbyOperationsPanel", () => {
  it("locks a synchronous double click to one readiness mutation", () => {
    mutate.mockClear();
    render(
      <LobbyOperationsPanel
        clock={clock}
        currentState="lobby-open"
        matchId="m7-preview"
        matchVersion={12}
        seedState="lobby-open"
        value={value}
      />,
    );

    const button = screen.getByRole("button", { name: "Confirm ready" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "confirm_ready",
        expectedState: "lobby-open",
        expectedVersion: 12,
      }),
      expect.any(Object),
    );
  });

  it("keeps issue reporting available independently during a live match", () => {
    render(
      <LobbyOperationsPanel
        clock={createMatchClockSnapshot("m7-preview", "in-progress", now, 14)}
        currentState="in-progress"
        matchId="m7-preview"
        matchVersion={14}
        seedState="in-progress"
        value={{
          ...value,
          connectionStatus: "in_progress",
          currentUserReady: true,
          opponentEntered: true,
          opponentReady: true,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Report issue" }));
    expect(screen.getByLabelText("Issue category")).toBeVisible();
    expect(screen.getByLabelText("Summary")).toBeVisible();
    expect(screen.getByRole("button", { name: "Submit issue" })).toBeDisabled();
  });
});
