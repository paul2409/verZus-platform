import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompetitionDiscoveryScreen } from "./CompetitionDiscoveryScreen";

describe("CompetitionDiscoveryScreen", () => {
  it("renders four game opportunities and the Crew War panel", () => {
    render(<CompetitionDiscoveryScreen />);

    expect(screen.getByRole("heading", { name: "Compete" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "EA FC Rookie Cup" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "League Ranked Open" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Clash Ladder Sprint" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "COD Squad Battles" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "War Day is Saturday" })).toBeVisible();
  });
});
