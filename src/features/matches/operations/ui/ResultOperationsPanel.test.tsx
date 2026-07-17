// VERZUS M7.6 RESULT OPERATIONS PANEL TESTS

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ResultOperationsPanel } from "./ResultOperationsPanel";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock("../api/match-result.mutations", () => ({
  useMatchResultMutation: () => ({ mutate, isPending: false, data: null, error: null }),
}));

const baseValue = {
  visible: true,
  stateTone: "info" as const,
  title: "Submit result",
  description: "Submit the final score.",
  primaryAction: null,
  secondaryAction: null,
  score: null,
  resultNote: null,
  xpEarned: null,
  submissionId: null,
  submittedAt: null,
  confirmedAt: null,
  confirmationStatus: "not_submitted" as const,
  canSubmit: true,
  canConfirm: false,
  canDispute: true,
  conflictCode: null,
};

describe("ResultOperationsPanel", () => {
  it("locks a synchronous double result submission", () => {
    mutate.mockClear();
    render(
      <ResultOperationsPanel
        currentState="submit-result"
        matchId="m7-preview"
        matchVersion={12}
        seedState="submit-result"
        value={baseValue}
      />,
    );

    const button = screen.getByRole("button", { name: "Submit result" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "submit_result",
        expectedState: "submit-result",
        expectedVersion: 12,
      }),
      expect.any(Object),
    );
  });

  it("shows a score conflict without implying that the submission was replaced", () => {
    render(
      <ResultOperationsPanel
        currentState="awaiting-opponent-confirmation"
        matchId="m7-preview"
        matchVersion={13}
        seedState="awaiting-opponent-confirmation"
        value={{
          ...baseValue,
          score: { home: 3, away: 2 },
          confirmationStatus: "conflict",
          canSubmit: false,
          canConfirm: true,
          conflictCode: "MATCH_RESULT_SCORE_CONFLICT",
        }}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("The submitted score remains unchanged");
    expect(screen.getByLabelText("Submitted score")).toHaveTextContent("3-2");
  });
});
