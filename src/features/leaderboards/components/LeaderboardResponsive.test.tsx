import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { leaderboardEntries } from "../mocks/leaderboard.mock";
import { LeaderboardResponsive } from "./LeaderboardResponsive";

describe("LeaderboardResponsive", () => {
  it("renders independent desktop and mobile presentations from one contract", () => {
    const { container } = render(<LeaderboardResponsive entries={leaderboardEntries} />);

    expect(container.querySelector('[data-leaderboard-presentation="table"]')).toBeInTheDocument();
    expect(
      container.querySelector('[data-leaderboard-presentation="mobile-list"]'),
    ).toBeInTheDocument();
  });

  it("renders a loading state without ranking content", () => {
    const { container } = render(<LeaderboardResponsive entries={[]} state="loading" />);

    expect(screen.getByRole("status", { name: "Loading leaderboard" })).toBeInTheDocument();
    expect(container.querySelector('[data-leaderboard-loading="true"]')).toBeInTheDocument();
  });

  it("renders retryable error and offline states", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    const { rerender } = render(
      <LeaderboardResponsive entries={[]} onRetry={onRetry} state="error" />,
    );

    await user.click(screen.getByRole("button", { name: "Retry leaderboard" }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    rerender(<LeaderboardResponsive entries={[]} state="offline" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Leaderboard offline");
  });

  it("keeps ranking data visible during stale and partial-failure states", () => {
    const { rerender } = render(
      <LeaderboardResponsive entries={leaderboardEntries} state="stale" />,
    );

    expect(screen.getByText(/slightly out of date/i)).toBeInTheDocument();
    expect(screen.getAllByText("JAYFLEX").length).toBeGreaterThan(0);

    rerender(<LeaderboardResponsive entries={leaderboardEntries} state="partial-failure" />);

    expect(screen.getByText(/could not be refreshed/i)).toBeInTheDocument();
    expect(screen.getAllByText("JAYFLEX").length).toBeGreaterThan(0);
  });
});
