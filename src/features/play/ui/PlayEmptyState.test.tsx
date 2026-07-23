import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlayEmptyState } from "./PlayEmptyState";

describe("PlayEmptyState CTA hierarchy", () => {
  it("keeps the Next Match action as the solid primary anchor", () => {
    render(
      <PlayEmptyState
        detail="Enter a competition to schedule your first match."
        primaryAction={{ href: "/compete", label: "FIND A COMPETITION" }}
        title="YOUR NEXT MATCH STARTS HERE"
        variant="match"
      />,
    );

    expect(screen.getByRole("link", { name: "FIND A COMPETITION" })).toHaveAttribute(
      "data-emphasis",
      "primary",
    );
  });

  it("demotes supporting empty-state actions to ghost and text treatments", () => {
    render(
      <PlayEmptyState
        detail="Confirmed fixtures appear here automatically."
        primaryAction={{ href: "/compete", label: "FIND COMPETITION" }}
        secondaryAction={{ href: "/matches", label: "OPEN SCHEDULE" }}
        title="BUILD YOUR FIRST WEEK"
        variant="schedule"
      />,
    );

    expect(screen.getByRole("link", { name: "FIND COMPETITION" })).toHaveAttribute(
      "data-emphasis",
      "ghost",
    );
    expect(screen.getByRole("link", { name: "OPEN SCHEDULE" })).toHaveAttribute(
      "data-emphasis",
      "text",
    );
  });
});
