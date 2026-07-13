import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatValue } from "./StatValue";

describe("StatValue", () => {
  it("renders label, value, affixes, detail, and visual configuration", () => {
    render(
      <StatValue
        detail="Current season"
        label="Win rate"
        prefix="≈"
        size="xl"
        suffix="%"
        tone="positive"
        value="82.4"
      />,
    );

    const stat = screen.getByText("Win rate").closest("div[data-stat-tone]");

    expect(stat).toHaveAttribute("data-stat-tone", "positive");
    expect(stat).toHaveAttribute("data-stat-size", "xl");
    expect(stat).toHaveTextContent("≈82.4%");
    expect(stat).toHaveTextContent("Current season");
  });
});
