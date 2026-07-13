import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RankBadge } from "./RankBadge";

describe("RankBadge", () => {
  it("renders an accessible rank and tier", () => {
    render(<RankBadge rank={1} tier="gold" />);

    const rank = screen.getByLabelText("Rank 1");

    expect(rank).toHaveAttribute("data-rank-tier", "gold");
    expect(rank).toHaveAttribute("data-rank-size", "md");
    expect(rank).toHaveTextContent("1");
  });
});
