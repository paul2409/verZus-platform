// VERZUS M8.2 LEADERBOARD EXPLORER COMPONENT TESTS
// VERZUS M8.4 MODE COMPOSITION COMPONENT TESTS
// VERZUS M8.7 ACCESSIBLE MODE TAB QUERIES

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { LeaderboardFoundationScreen } from "./LeaderboardFoundationScreen";

describe("LeaderboardFoundationScreen", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/leaderboards/weekly");
  });

  it("hydrates controls and renders separate mode-owned presentations", () => {
    const { container } = render(
      <LeaderboardFoundationScreen
        initialSearchParams={{ mode: "crew", sort: "points", direction: "desc", size: "3" }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Crew Leaderboard" })).toBeVisible();
    expect(screen.getByLabelText("Sort")).toHaveValue("points");
    expect(screen.getByLabelText("Direction")).toHaveValue("desc");
    expect(screen.getByLabelText("Rows per page")).toHaveValue("3");
    expect(screen.getByLabelText("Game")).toBeDisabled();
    expect(screen.getByRole("columnheader", { name: "Members" })).toBeVisible();
    expect(container.querySelector('[data-leaderboard-mode="crew"]')).toBeInTheDocument();
    expect(container.querySelector('[data-leaderboard-presentation="table"]')).toBeInTheDocument();
    expect(
      container.querySelector('[data-leaderboard-presentation="mobile-list"]'),
    ).toBeInTheDocument();
  });

  it("writes mode defaults, filters, sort and pagination into the URL", async () => {
    const user = userEvent.setup();
    render(<LeaderboardFoundationScreen />);

    await user.click(screen.getByRole("tab", { name: "Game" }));
    expect(screen.getByLabelText("Game")).toHaveValue("ea-fc");
    expect(window.location.search).toContain("mode=game");
    expect(window.location.search).toContain("game=ea-fc");

    await user.selectOptions(screen.getByLabelText("Game"), "cod-mobile");
    expect(window.location.search).toContain("game=cod-mobile");

    await user.click(screen.getByRole("tab", { name: "Crew" }));
    await user.selectOptions(screen.getByLabelText("Sort"), "points");
    await user.selectOptions(screen.getByLabelText("Direction"), "desc");
    await user.selectOptions(screen.getByLabelText("Rows per page"), "3");
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(window.location.search).toContain("mode=crew");
    expect(window.location.search).toContain("sort=points");
    expect(window.location.search).toContain("direction=desc");
    expect(window.location.search).toContain("size=3");
    expect(window.location.search).toContain("page=2");
  });

  it("debounces search and shows a recoverable no-result state", async () => {
    const user = userEvent.setup();
    render(<LeaderboardFoundationScreen />);

    await user.type(screen.getByRole("searchbox", { name: "Search rankings" }), "missing player");
    expect(window.location.search).not.toContain("q=");

    await waitFor(() => {
      expect(window.location.search).toContain("q=missing+player");
    });
    expect(screen.getByText("No rankings match your search and filters")).toBeVisible();

    await user.click(screen.getAllByRole("button", { name: "Reset filters" })[0]!);
    await waitFor(() => {
      expect(
        screen.queryByText("No rankings match your search and filters"),
      ).not.toBeInTheDocument();
    });
    expect(window.location.search).toBe("");
  });

  it("restores URL state and applies server-owned mode constraints", () => {
    render(<LeaderboardFoundationScreen />);

    act(() => {
      window.history.pushState(null, "", "/leaderboards/weekly?mode=pools&scope=friends");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(screen.getByRole("heading", { name: "Pool Standings" })).toBeVisible();
    expect(screen.getByLabelText("Scope")).toHaveValue("global");
    expect(screen.getByLabelText("Scope")).toBeDisabled();
    expect(screen.getByRole("columnheader", { name: "Pool" })).toBeVisible();
  });
});
