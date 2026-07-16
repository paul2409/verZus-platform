import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LeaderboardScreen } from "./LeaderboardScreen";

describe("LeaderboardScreen", () => {
  it("renders game lanes, rankings and the current-player position", () => {
    render(<LeaderboardScreen />);

    expect(screen.getByRole("heading", { name: "Rankings" })).toBeVisible();
    expect(screen.getByRole("button", { name: /EA FC/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Your position")).toBeVisible();
    expect(screen.getByRole("link", { name: /View full game rankings/i })).toBeVisible();
  });
});
