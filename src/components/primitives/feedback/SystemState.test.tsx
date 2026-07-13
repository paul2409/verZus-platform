import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  EmptyState,
  ErrorState,
  OfflineState,
  PartialFailureState,
  RetryAction,
  RetryingState,
  SystemState,
} from "./SystemState";

describe("SystemState", () => {
  it("renders a semantic state with stable attributes", () => {
    render(
      <SystemState
        aria-label="Leaderboard unavailable"
        description="Rankings could not be loaded."
        kind="error"
        title="Leaderboard unavailable"
      />,
    );

    const state = screen.getByLabelText("Leaderboard unavailable");
    expect(state).toHaveAttribute("data-system-state", "error");
    expect(state).toHaveTextContent("Rankings could not be loaded.");
  });

  it("marks loading and retrying states as busy", () => {
    render(
      <>
        <SystemState aria-label="Loading" kind="loading" title="Loading" />
        <RetryingState aria-label="Retrying" title="Retrying" />
      </>,
    );

    expect(screen.getByLabelText("Loading")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByLabelText("Retrying")).toHaveAttribute("aria-busy", "true");
  });

  it("does not announce ordinary states unless requested", () => {
    render(<EmptyState aria-label="No matches" title="No matches" />);
    expect(screen.getByLabelText("No matches")).not.toHaveAttribute("role");
  });

  it("supports opt-in alert announcements", () => {
    render(<ErrorState announce aria-label="Match service error" title="Match service error" />);

    expect(screen.getByRole("alert")).toHaveAccessibleName("Match service error");
  });

  it("keeps successful sibling content available beside partial failure", () => {
    render(
      <div>
        <p>Next match remains available</p>
        <PartialFailureState aria-label="Crew feed degraded" title="Crew feed degraded" />
      </div>,
    );

    expect(screen.getByText("Next match remains available")).toBeInTheDocument();
    expect(screen.getByLabelText("Crew feed degraded")).toHaveAttribute(
      "data-system-state",
      "partial-failure",
    );
  });

  it("provides a reusable retry action", () => {
    const onRetry = vi.fn();
    render(<RetryAction onRetry={onRetry} />);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("exposes dedicated offline wrapper", () => {
    render(<OfflineState aria-label="Offline" title="You are offline" />);
    expect(screen.getByLabelText("Offline")).toHaveAttribute("data-system-state", "offline");
  });
});
