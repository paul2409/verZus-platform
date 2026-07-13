import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl, SegmentedControlItem } from "./SegmentedControl";

describe("SegmentedControl", () => {
  it("renders a radiogroup with one selected option", () => {
    render(
      <SegmentedControl aria-label="Leaderboard period" defaultValue="week">
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="season">Season</SegmentedControlItem>
      </SegmentedControl>,
    );

    expect(screen.getByRole("radiogroup", { name: "Leaderboard period" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute("aria-checked", "true");
  });

  it("changes selection after a click", async () => {
    const user = userEvent.setup();

    render(
      <SegmentedControl aria-label="Leaderboard period" defaultValue="week">
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="season">Season</SegmentedControlItem>
      </SegmentedControl>,
    );

    await user.click(screen.getByRole("radio", { name: "Season" }));

    expect(screen.getByRole("radio", { name: "Season" })).toHaveAttribute("aria-checked", "true");
  });

  it("uses arrow keys and skips disabled options", async () => {
    const user = userEvent.setup();

    render(
      <SegmentedControl aria-label="View mode" defaultValue="cards">
        <SegmentedControlItem value="cards">Cards</SegmentedControlItem>
        <SegmentedControlItem disabled value="locked">
          Locked
        </SegmentedControlItem>
        <SegmentedControlItem value="compact">Compact</SegmentedControlItem>
      </SegmentedControl>,
    );

    const cards = screen.getByRole("radio", { name: "Cards" });
    cards.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("radio", { name: "Compact" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Compact" })).toHaveAttribute("aria-checked", "true");
  });

  it("supports controlled selection", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <SegmentedControl aria-label="Controlled mode" onValueChange={onValueChange} value="cards">
        <SegmentedControlItem value="cards">Cards</SegmentedControlItem>
        <SegmentedControlItem value="compact">Compact</SegmentedControlItem>
      </SegmentedControl>,
    );

    await user.click(screen.getByRole("radio", { name: "Compact" }));

    expect(onValueChange).toHaveBeenCalledWith("compact");
    expect(screen.getByRole("radio", { name: "Cards" })).toHaveAttribute("aria-checked", "true");
  });
});
