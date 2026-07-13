import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import LeaderboardPreviewPage from "./page";

describe("LeaderboardPreviewPage", () => {
  it("renders the Step 13 leaderboard gallery", () => {
    render(<LeaderboardPreviewPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Leaderboard System" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("JAYFLEX").length).toBeGreaterThan(0);
    expect(screen.getByText("Mobile ranking list")).toBeInTheDocument();
    expect(screen.getByText("Desktop data table")).toBeInTheDocument();
  });

  it("switches between operational states", async () => {
    const user = userEvent.setup();
    render(<LeaderboardPreviewPage />);

    await user.click(screen.getByRole("radio", { name: "offline" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Leaderboard offline");
  });

  it("sorts the desktop presentation without changing the shared contract", async () => {
    const user = userEvent.setup();
    render(<LeaderboardPreviewPage />);

    await user.click(screen.getByRole("button", { name: /points/i }));

    expect(screen.getByRole("columnheader", { name: /points/i })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
  });
});
