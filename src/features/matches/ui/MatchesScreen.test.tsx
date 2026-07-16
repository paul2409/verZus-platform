import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MatchesScreen } from "./MatchesScreen";

describe("MatchesScreen", () => {
  it("renders active match rows with watch actions", () => {
    render(<MatchesScreen />);

    expect(screen.getByRole("heading", { name: "ACTIVE MATCHES" })).toBeVisible();
    expect(screen.getByText("TITANONE vs XENOLYNX")).toBeVisible();
    expect(screen.getAllByRole("button", { name: "WATCH" })).toHaveLength(4);
    expect(screen.getByText("LIVE")).toBeVisible();
  });
});
