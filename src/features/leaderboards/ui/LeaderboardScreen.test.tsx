// VERZUS M8.3 LEADERBOARD SCREEN ROUTE WRAPPER TEST
// VERZUS M8.4 MODE COMPOSITION ROUTE TEST
// VERZUS M8.5 UPDATE-STABILITY ROUTE TEST
// VERZUS M8.6 RELIABILITY ROUTE TEST

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LeaderboardScreen } from "./LeaderboardScreen";

describe("LeaderboardScreen", () => {
  it("retains URL exploration while rendering the M8.6 combine composition", () => {
    const { container } = render(
      <LeaderboardScreen
        enableRemoteResources={false}
        initialSearchParams={{ mode: "combine", page: "1" }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Leaderboards" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Combine Leaderboard" })).toBeVisible();
    expect(container.querySelector('[data-m8-stage="8.6"]')).toBeInTheDocument();
    expect(container.querySelector('[data-leaderboard-mode="combine"]')).toBeInTheDocument();
    expect(container.querySelector('[data-resource-source="local"]')).toBeInTheDocument();
  });
});
