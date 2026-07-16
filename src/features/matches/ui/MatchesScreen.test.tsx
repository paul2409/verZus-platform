import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MatchesScreen } from "./MatchesScreen";

describe("MatchesScreen", () => {
  it("keeps match actions and verified results visible", () => {
    render(<MatchesScreen />);

    expect(screen.getByRole("heading", { name: "Matches" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Check in now" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Recent matches" })).toBeVisible();
    expect(screen.getAllByText("WIN")).toHaveLength(3);
  });
});
