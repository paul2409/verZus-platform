import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Divider, SectionHeader } from "./LayoutFeedback";

describe("Divider", () => {
  it("renders an accessible horizontal separator", () => {
    render(<Divider label="Competition states" tone="accent" />);
    const divider = screen.getByRole("separator");
    expect(divider).toHaveAttribute("aria-orientation", "horizontal");
    expect(divider).toHaveTextContent("Competition states");
  });

  it("supports vertical orientation", () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });
});

describe("SectionHeader", () => {
  it("renders configurable heading level and action", () => {
    render(
      <SectionHeader
        action={<button type="button">View all</button>}
        as="h3"
        description="Current competition activity"
        eyebrow="Live operations"
        title="Competition centre"
      />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Competition centre" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View all" })).toBeInTheDocument();
  });

  it("exposes stable size and alignment attributes", () => {
    const { container } = render(<SectionHeader align="start" size="lg" title="Player overview" />);
    expect(container.firstElementChild).toHaveAttribute("data-section-header-size", "lg");
    expect(container.firstElementChild).toHaveAttribute("data-section-header-align", "start");
  });
});
