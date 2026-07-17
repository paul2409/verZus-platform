// VERZUS M7.6 DISPUTE OPERATIONS PANEL TESTS

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DisputeOperationsPanel } from "./DisputeOperationsPanel";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock("../api/match-result.mutations", () => ({
  useMatchDisputeMutation: () => ({ mutate, isPending: false, data: null, error: null }),
}));

const value = {
  visible: true,
  title: "Open a dispute",
  resultNote: null,
  disputeId: null,
  statusLabel: "Not opened",
  secondaryAction: null,
  reasonCode: null,
  summary: null,
  createdAt: null,
  auditEventCount: 0,
  canCreate: true,
};

describe("DisputeOperationsPanel", () => {
  it("requires meaningful details and submits one auditable command", () => {
    mutate.mockClear();
    render(
      <DisputeOperationsPanel
        currentState="awaiting-opponent-confirmation"
        matchId="m7-preview"
        matchVersion={13}
        seedState="awaiting-opponent-confirmation"
        value={value}
      />,
    );

    const button = screen.getByRole("button", { name: "Open dispute" });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Dispute details"), {
      target: { value: "Opponent submitted a different final score." },
    });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedState: "awaiting-opponent-confirmation",
        expectedVersion: 13,
        reason: "score_mismatch",
      }),
      expect.any(Object),
    );
  });

  it("renders persisted dispute and audit information", () => {
    render(
      <DisputeOperationsPanel
        currentState="disputed"
        matchId="m7-preview"
        matchVersion={14}
        seedState="disputed"
        value={{
          ...value,
          disputeId: "DSP-25-00081",
          statusLabel: "Under review",
          reasonCode: "score_mismatch",
          summary: "The scores conflict.",
          createdAt: "2026-07-17T01:00:00.000Z",
          auditEventCount: 1,
          canCreate: false,
        }}
      />,
    );

    expect(screen.getByText("DSP-25-00081")).toBeVisible();
    expect(screen.getByText("Under review")).toBeVisible();
    expect(screen.getByText("1")).toBeVisible();
  });
});
