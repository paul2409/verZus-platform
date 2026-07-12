import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon } from "./Icon";

describe("Icon", () => {
  it("renders decorative icons as hidden from assistive technology", () => {
    const { container } = render(<Icon decorative name="trophy" />);

    const icon = container.querySelector("svg");

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).not.toHaveAttribute("role");
  });

  it("renders meaningful icons with an accessible name", () => {
    render(<Icon decorative={false} label="Tournament trophy" name="trophy" />);

    expect(
      screen.getByRole("img", {
        name: "Tournament trophy",
      }),
    ).toBeInTheDocument();
  });

  it("exposes stable inspection attributes", () => {
    const { container } = render(<Icon decorative name="gamepad" size="lg" tone="primary" />);

    const icon = container.querySelector("svg");

    expect(icon).toHaveAttribute("data-icon", "gamepad");
    expect(icon).toHaveAttribute("data-icon-size", "lg");
    expect(icon).toHaveAttribute("data-icon-tone", "primary");
  });

  it("forwards native SVG attributes", () => {
    render(<Icon data-testid="custom-icon" decorative name="search" />);

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
