// VERZUS M8.7 LEADERBOARD ACCESSIBILITY CONTRACT TESTS

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LeaderboardFoundationScreen } from "../../foundation";

describe("leaderboard accessibility contract", () => {
  it("exposes a skip link, one tab stop, table caption and active sort metadata", () => {
    render(<LeaderboardFoundationScreen />);

    expect(screen.getByRole("link", { name: "Skip to rankings" })).toHaveAttribute(
      "href",
      "#leaderboard-results",
    );

    const tablist = screen.getByRole("tablist", { name: "Leaderboard modes" });
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs.filter((tab) => tab.getAttribute("tabindex") === "0")).toHaveLength(1);

    const table = screen.getByRole("table", { name: /Weekly Leaderboard/i });
    expect(within(table).getByText(/Verified weekly points/i)).toBeVisible();
    expect(within(table).getByRole("columnheader", { name: "Rank" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });

  it("keeps rankings available when a side widget crashes", () => {
    render(
      <LeaderboardFoundationScreen
        crashTarget="current-position"
        onRecoverWidget={() => undefined}
      />,
    );

    expect(screen.getByRole("table", { name: /Weekly Leaderboard/i })).toBeVisible();
    expect(screen.getByRole("alert", { name: "Current position unavailable" })).toBeVisible();
    expect(screen.getByRole("tablist", { name: "Leaderboard modes" })).toBeVisible();
  });
});
