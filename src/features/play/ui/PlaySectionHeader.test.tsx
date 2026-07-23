import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlaySectionHeader } from "./PlaySectionHeader";

describe("PlaySectionHeader", () => {
  it("renders a labelled dashboard group with its detail and tone", () => {
    render(
      <PlaySectionHeader
        className="test-section"
        detail="Your next fixture and immediate actions."
        eyebrow="CURRENT PRIORITY"
        index="01"
        title="MATCH OPERATIONS"
        tone="cyan"
      />,
    );

    expect(screen.getByRole("heading", { name: "MATCH OPERATIONS" })).toBeVisible();
    expect(screen.getByText("CURRENT PRIORITY")).toBeVisible();
    expect(screen.getByText("Your next fixture and immediate actions.")).toBeVisible();
    expect(screen.getByRole("banner")).toHaveAttribute("data-tone", "cyan");
  });
});
