import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { leaderboardEntries } from "../mocks/leaderboard.mock";
import { LeaderboardMobileList } from "./LeaderboardMobileList";

describe("LeaderboardMobileList", () => {
  it("renders a dedicated mobile ranking list", () => {
    render(<LeaderboardMobileList entries={leaderboardEntries.slice(0, 2)} />);

    expect(screen.getByRole("list", { name: "Mobile leaderboard rankings" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: /rank 1: kairo blaze/i })).toBeInTheDocument();
    expect(screen.getByText("2,840")).toBeInTheDocument();
  });

  it("reveals secondary statistics through native details disclosure", () => {
    render(<LeaderboardMobileList entries={[leaderboardEntries[0]!]} />);

    const summary = screen.getByText("View full stats");
    fireEvent.click(summary);

    expect(screen.getByText("87.5%")).toBeInTheDocument();
    expect(screen.getByText("Iron Wolves")).toBeInTheDocument();
  });

  it("supports players without a crew", () => {
    render(<LeaderboardMobileList entries={[leaderboardEntries[4]!]} />);

    fireEvent.click(screen.getByText("View full stats"));

    expect(screen.getByText("Independent player")).toBeInTheDocument();
  });
});
