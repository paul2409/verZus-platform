import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NavigationStatesPreviewPage from "./page";

describe("NavigationStatesPreviewPage", () => {
  it("renders the complete navigation-state approval surface", () => {
    render(<NavigationStatesPreviewPage />);

    expect(screen.getByRole("heading", { name: "Navigation state system" })).toBeInTheDocument();
    expect(screen.getByText("Feature flagged")).toBeInTheDocument();
    expect(screen.getByText("Navigation survives feature failure")).toBeInTheDocument();
    expect(
      screen
        .getAllByText("Leaderboards")
        .some((element) => element.closest("a")?.getAttribute("aria-current") === "page"),
    ).toBe(true);
  });
});
