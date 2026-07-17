// VERZUS M7.4 CHECK-IN CONTROL TESTS

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createMatchClockSnapshot } from "../model/match-clock.policy";
import { CheckInMutationPanel } from "./CheckInMutationPanel";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock("../api/match-check-in.mutation", () => ({
  useMatchCheckInMutation: () => ({
    mutate,
    isPending: false,
    data: null,
    error: null,
  }),
}));

const value = {
  visible: true,
  stateTone: "success" as const,
  title: "Check-in is open",
  description: "Confirm presence.",
  timerLabel: "00H 24M 13S",
  timerCaption: "Check-in ends",
  primaryAction: { label: "Check in", tone: "primary" as const, disabled: false },
  secondaryAction: null,
};

const clock = createMatchClockSnapshot(
  "m7-preview",
  "check-in-open",
  new Date("2026-07-16T20:00:00.000Z"),
);

describe("CheckInMutationPanel", () => {
  it("locks a synchronous double click to one mutation", () => {
    mutate.mockClear();
    render(
      <CheckInMutationPanel
        clock={clock}
        currentState="check-in-open"
        currentUserCheckedIn={false}
        matchId="m7-preview"
        matchVersion={12}
        opponentCheckedIn={false}
        seedState="check-in-open"
        value={value}
      />,
    );

    const button = screen.getByRole("button", { name: "Check in" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedState: "check-in-open",
        expectedVersion: 12,
      }),
      expect.any(Object),
    );
  });

  it("disables check-in after persisted confirmation", () => {
    render(
      <CheckInMutationPanel
        clock={clock}
        currentState="checked-in"
        currentUserCheckedIn
        matchId="m7-preview"
        matchVersion={13}
        opponentCheckedIn={false}
        seedState="check-in-open"
        value={{ ...value, title: "You are checked in" }}
      />,
    );

    expect(screen.getByRole("button", { name: "Check in" })).toBeDisabled();
    expect(screen.getByText(/waiting for the opponent/i)).toBeVisible();
  });
});
