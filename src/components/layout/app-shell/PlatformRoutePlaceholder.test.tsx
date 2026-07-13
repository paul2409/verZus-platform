import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlatformRoutePlaceholder } from "./PlatformRoutePlaceholder";

describe("PlatformRoutePlaceholder", () => {
  it("renders route metadata and production navigation links", () => {
    render(<PlatformRoutePlaceholder routeId="leaderboards-weekly" />);

    expect(screen.getByRole("heading", { name: "Weekly Leaderboard" })).toBeInTheDocument();
    expect(screen.getByText("/leaderboards/weekly")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link")
        .find(
          (link) => link.getAttribute("href") === "/play" && link.textContent === "PlayPrimary",
        ),
    ).toBeDefined();
  });
});
