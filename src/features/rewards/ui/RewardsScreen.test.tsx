// VERZUS M10.1 OPTIONAL REWARDS FOUNDATION TEST

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RewardsScreen } from "./RewardsScreen";

describe("RewardsScreen", () => {
  it("renders the M10 progression hierarchy", () => {
    render(<RewardsScreen />);

    expect(screen.getByRole("heading", { name: "Rewards" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Your progress" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Claimable rewards" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Reward track" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Recently claimed" })).toBeVisible();
  });
});
