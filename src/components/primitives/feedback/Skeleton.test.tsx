import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("is decorative by default", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("can announce a meaningful loading label", () => {
    render(<Skeleton label="Loading player identity" variant="circle" />);
    expect(screen.getByRole("status", { name: "Loading player identity" })).toBeInTheDocument();
  });

  it("exposes stable variant and animation attributes", () => {
    const { container } = render(<Skeleton animation="pulse" variant="card" />);
    expect(container.firstElementChild).toHaveAttribute("data-skeleton-variant", "card");
    expect(container.firstElementChild).toHaveAttribute("data-skeleton-animation", "pulse");
  });

  it("supports explicit dimensions", () => {
    const { container } = render(<Skeleton height={48} width="75%" />);
    expect(container.firstElementChild).toHaveStyle({ height: "48px", width: "75%" });
  });
});
