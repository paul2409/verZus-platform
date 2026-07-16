import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IntelCardProvider } from "@/components/primitives/intel-card";

import { LeaderboardScreen } from "./LeaderboardScreen";

describe("LeaderboardScreen", () => {
  it("renders game lanes, rankings and the current-player position", () => {
    render(
      <IntelCardProvider>
        <LeaderboardScreen />
      </IntelCardProvider>,
    );

    expect(screen.getByRole("heading", { name: "Rankings" })).toBeVisible();
    expect(screen.getByRole("button", { name: /EA FC/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Your position")).toBeVisible();
    expect(screen.getByRole("link", { name: /View full game rankings/i })).toBeVisible();
  });
});
