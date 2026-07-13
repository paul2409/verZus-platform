import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import BottomNavigationPreviewPage from "./page";

describe("BottomNavigationPreviewPage", () => {
  it("renders the approved five-destination primary navigation", () => {
    render(<BottomNavigationPreviewPage />);

    const navigation = screen.getByRole("navigation", {
      name: "Primary preview navigation",
    });

    expect(
      screen.getByRole("heading", { level: 1, name: "Bottom Navigation" }),
    ).toBeInTheDocument();
    expect(within(navigation).getAllByRole("link")).toHaveLength(5);
    expect(within(navigation).getByRole("link", { name: "Play" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("keeps navigation available when an unrelated Crew module fails", () => {
    render(<BottomNavigationPreviewPage />);

    expect(screen.getByRole("article", { name: "Crew feed failure" })).toHaveAttribute(
      "data-panel-module-state",
      "error",
    );
    expect(
      screen.getByRole("navigation", { name: "Primary preview navigation" }),
    ).toBeInTheDocument();
  });

  it("renders notification, partial and disabled navigation states", () => {
    render(<BottomNavigationPreviewPage />);

    expect(screen.getByRole("status", { name: "4 unread Crew notifications" })).toBeInTheDocument();

    const degradedNavigation = screen.getByRole("navigation", {
      name: "Degraded preview navigation",
    });

    expect(
      within(degradedNavigation).getByRole("link", { name: /Crew/ }).closest("li"),
    ).toHaveAttribute("data-navigation-state", "partial");
    expect(within(degradedNavigation).getByRole("link", { name: /Rewards/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
