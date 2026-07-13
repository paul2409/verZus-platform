import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FeedbackPreviewPage from "./page";

describe("FeedbackPreviewPage", () => {
  it("renders the complete system-state catalogue", () => {
    render(<FeedbackPreviewPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Feedback and System States" }),
    ).toBeInTheDocument();

    expect(screen.getByText("No competitions found")).toBeInTheDocument();
    expect(screen.getByText("Crew data partially available")).toBeInTheDocument();
    expect(screen.getByText("Result submitted")).toBeInTheDocument();
  });

  it("renders independent success, warning and error notifications", () => {
    render(<FeedbackPreviewPage />);

    expect(screen.getByText("Result saved")).toBeInTheDocument();
    expect(screen.getByText("Leaderboard is stale")).toBeInTheDocument();
    expect(screen.getByText("Partial service failure")).toBeInTheDocument();
  });

  it("dismisses one toast without removing the others", () => {
    render(<FeedbackPreviewPage />);

    const dismissButtons = screen.getAllByRole("button", {
      name: "Dismiss notification",
    });
    fireEvent.click(dismissButtons[0]!);

    expect(screen.queryByText("Result saved")).not.toBeInTheDocument();
    expect(screen.getByText("Leaderboard is stale")).toBeInTheDocument();
    expect(screen.getByText("Partial service failure")).toBeInTheDocument();
  });
});
