import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CompetitionEntryControl } from "./CompetitionEntryControl";

const confirmEntry = vi.fn();
const resetMutation = vi.fn();

vi.mock("../hooks", () => ({
  useCompetitionEntry: () => ({
    resource: {
      state: "success",
      data: {
        value: {
          competitionId: "ea-fc-rookie-cup",
          competitionName: "EA FC ROOKIE CUP",
          lifecycleState: "registration_open",
          lifecycleLabel: "REGISTRATION OPEN",
          stateVersion: "ea-fc-rookie-cup:registration_open:v1",
          canEnter: true,
          eligibilityState: "eligible",
          eligibilityLabel: "ELIGIBLE",
          eligibilitySummary: "Your player identity satisfies the requirements.",
          entrantLabel: "JAYFLEX",
          teamLabel: "SOLO ENTRY",
          gameLabel: "EA FC",
          formatLabel: "SWISS FORMAT",
          entryFeeLabel: "FREE",
          rosterLockLabel: "ROSTER LOCKS WHEN CHECK-IN OPENS",
          checkInLabel: "CHECK-IN: JUL 19 · 17:30 WAT",
          existingEntry: null,
        },
        meta: {
          requestId: "test-request",
          serverNow: "2026-07-16T12:00:00.000Z",
          lastUpdatedAt: "2026-07-16T12:00:00.000Z",
          freshness: "fresh",
        },
      },
      requestId: "test-request",
      errorCode: null,
      canRetry: true,
    },
    mutationState: "idle",
    result: null,
    errorCode: null,
    requestId: null,
    confirmEntry,
    retryResource: vi.fn(),
    resetMutation,
  }),
}));

describe("CompetitionEntryControl", () => {
  it("requires explicit confirmation before submitting entry", async () => {
    const user = userEvent.setup();
    render(<CompetitionEntryControl competitionId="ea-fc-rookie-cup" scenario="normal" />);

    await user.click(screen.getByRole("button", { name: "ENTER COMPETITION" }));
    const submit = screen.getByRole("button", { name: "CONFIRM ENTRY" });
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole("checkbox", { name: "CONFIRM ENTRY TERMS" }));
    await user.click(submit);

    expect(confirmEntry).toHaveBeenCalledTimes(1);
  });
});
