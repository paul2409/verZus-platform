import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders configuration and decorative visuals", () => {
    render(
      <Badge
        leadingVisual={<span>!</span>}
        size="lg"
        tone="warning"
        trailingVisual={<span>+</span>}
        variant="outline"
      >
        Check-in closes soon
      </Badge>,
    );

    const badge = screen.getByText("Check-in closes soon").closest("span[data-badge-tone]");

    expect(badge).toHaveAttribute("data-badge-tone", "warning");
    expect(badge).toHaveAttribute("data-badge-variant", "outline");
    expect(badge).toHaveAttribute("data-badge-size", "lg");
    expect(badge?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });

  it("exposes disabled state without pretending to be a button", () => {
    render(<Badge disabled>Unavailable</Badge>);

    const badge = screen.getByText("Unavailable").closest("span[data-badge-disabled]");

    expect(badge).toHaveAttribute("aria-disabled", "true");
    expect(badge).toHaveAttribute("data-badge-disabled", "true");
    expect(badge).not.toHaveAttribute("role", "button");
    expect(badge).not.toHaveAttribute("tabindex");
  });
});
