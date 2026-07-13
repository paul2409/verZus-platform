import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { leaderboardEntries, pinnedLeaderboardEntry } from "../mocks/leaderboard.mock";
import { LeaderboardTable } from "./LeaderboardTable";

describe("LeaderboardTable", () => {
  it("renders an accessible desktop table with ranking data", () => {
    render(<LeaderboardTable entries={leaderboardEntries} />);

    expect(screen.getByRole("table", { name: "Leaderboard rankings" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Player" })).toBeInTheDocument();
    expect(screen.getByText("JAYFLEX")).toBeInTheDocument();
    expect(screen.getByText("2,510")).toBeInTheDocument();
  });

  it("emits the next sort state from sortable headers", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    render(
      <LeaderboardTable
        entries={leaderboardEntries}
        onSortChange={onSortChange}
        sort={{ key: "points", direction: "descending" }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /points/i }));

    expect(onSortChange).toHaveBeenCalledWith({
      key: "points",
      direction: "ascending",
    });
  });

  it("renders current-player and pinned-row treatments", () => {
    const { container } = render(
      <LeaderboardTable entries={leaderboardEntries} pinnedEntry={pinnedLeaderboardEntry} />,
    );

    expect(container.querySelector('[data-current-player="true"]')).toBeInTheDocument();
    expect(container.querySelector('[data-pinned-entry="true"]')).toBeInTheDocument();
  });
});
