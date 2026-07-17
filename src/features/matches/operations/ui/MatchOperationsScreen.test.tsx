// VERZUS M7.1 MATCH OPERATIONS FOUNDATION
// VERZUS M7.2 SERVER CLOCK SCREEN INTEGRATION TESTS

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createMatchClockSnapshot } from "../model/match-clock.policy";
import { MatchOperationsScreen } from "./MatchOperationsScreen";

const now = new Date("2026-07-16T20:00:00.000Z");

function renderState(state: Parameters<typeof createMatchClockSnapshot>[1]) {
  const clock = createMatchClockSnapshot("m7-preview", state, now);
  return render(<MatchOperationsScreen clock={clock} matchId="m7-preview" state={state} />);
}

describe("MatchOperationsScreen", () => {
  it("renders the approved check-in-open screen from server clock state", () => {
    renderState("check-in-open");

    expect(screen.getByRole("heading", { name: "Match details" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Check-in is open" })).toBeVisible();
    expect(screen.getByText("Rebels United")).toBeVisible();
    expect(screen.getByText("Apex Predators")).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Match state references" })).toBeVisible();
    expect(screen.getAllByRole("link")).toHaveLength(16);
    expect(screen.getByRole("button", { name: "Check in" })).toBeDisabled();
    expect(screen.getByTestId("server-countdown")).toHaveTextContent("00H 24M 13S");
    expect(screen.getByText(/drift corrected from server anchor/i)).toBeVisible();
  });

  it("renders terminal and dispute panels independently", () => {
    const disputedClock = createMatchClockSnapshot("m7-preview", "disputed", now);
    const completedClock = createMatchClockSnapshot("m7-preview", "completed", now);
    const { rerender } = render(
      <MatchOperationsScreen clock={disputedClock} matchId="m7-preview" state="disputed" />,
    );

    expect(screen.getByRole("heading", { name: "Dispute in progress" })).toBeVisible();
    expect(screen.getByText("DSP-25-00081")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Evidence" })).toBeVisible();

    rerender(
      <MatchOperationsScreen clock={completedClock} matchId="m7-preview" state="completed" />,
    );

    expect(screen.getByRole("heading", { name: "Match completed" })).toBeVisible();
    expect(screen.getByText("+75 XP")).toBeVisible();
  });
});
