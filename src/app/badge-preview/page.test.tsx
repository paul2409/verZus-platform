import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import BadgePreviewPage from "./page";

describe("BadgePreviewPage", () => {
  it("renders the badge and status catalogue", () => {
    const { container } = render(<BadgePreviewPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Badges and Status",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Check-in closes").closest("span[data-badge-tone]")).toHaveAttribute(
      "data-badge-tone",
      "warning",
    );

    expect(container.querySelector('span[data-status="live"]')).toBeInTheDocument();
  });

  it("renders every rank tier", () => {
    render(<BadgePreviewPage />);

    expect(screen.getByLabelText("Rank 24")).toHaveAttribute("data-rank-tier", "standard");
    expect(screen.getByLabelText("Rank 3")).toHaveAttribute("data-rank-tier", "bronze");
    expect(screen.getByLabelText("Rank 2")).toHaveAttribute("data-rank-tier", "silver");
    expect(screen.getByLabelText("Rank 1")).toHaveAttribute("data-rank-tier", "gold");
    expect(screen.getByLabelText("Rank S")).toHaveAttribute("data-rank-tier", "elite");
  });

  it("renders movement and performance examples", () => {
    render(<BadgePreviewPage />);

    expect(screen.getByLabelText("Ranking increased 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Ranking decreased 2")).toBeInTheDocument();
    expect(screen.getByText("81.8")).toBeInTheDocument();
    expect(screen.getByText("A+")).toBeInTheDocument();
  });
});
