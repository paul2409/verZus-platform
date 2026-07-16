import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RewardsScreen } from "./RewardsScreen";

describe("RewardsScreen", () => {
  it("distinguishes Cash Credits, Bonus Credits and VS Points", () => {
    render(<RewardsScreen />);

    expect(screen.getByRole("heading", { name: "Rewards" })).toBeVisible();
    expect(screen.getByText("Cash credits")).toBeVisible();
    expect(screen.getByText("Bonus credits")).toBeVisible();
    expect(screen.getByText("VS Points")).toBeVisible();
    expect(screen.getByRole("button", { name: "Withdraw cash credits" })).toBeVisible();
  });
});
