import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CardPreviewPage from "./page";

describe("CardPreviewPage", () => {
  it("renders the approved trading-card catalogue", () => {
    render(<CardPreviewPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Trading-Card and Panel System",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("article", {
        name: "Night Ravens Crew card",
      }),
    ).toHaveAttribute("data-card-rarity", "epic");

    expect(
      screen.getByRole("article", {
        name: "Iron Wolves Crew card",
      }),
    ).toHaveAttribute("data-card-rarity", "legendary");
  });

  it("keeps successful and failed modules together", () => {
    render(<CardPreviewPage />);

    expect(
      screen.getByRole("article", {
        name: "Next match module",
      }),
    ).toHaveAttribute("data-panel-module-state", "success");

    expect(
      screen.getByRole("article", {
        name: "Crew activity module",
      }),
    ).toHaveAttribute("data-panel-module-state", "partial-failure");

    expect(
      screen.getByRole("button", {
        name: "Open match room",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Retry activity feed",
      }),
    ).toBeInTheDocument();
  });

  it("provides operational actions without making cards fake buttons", () => {
    render(<CardPreviewPage />);

    const crewCard = screen.getByRole("article", {
      name: "Voltage Union Crew card",
    });

    expect(crewCard).not.toHaveAttribute("role", "button");

    expect(
      screen.getAllByRole("button", {
        name: "Inspect Crew",
      }),
    ).toHaveLength(3);

    expect(
      screen.getByRole("button", {
        name: "Refresh panel",
      }),
    ).toBeInTheDocument();
  });
});
