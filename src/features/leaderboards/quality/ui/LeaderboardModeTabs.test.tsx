// VERZUS M8.7 MODE TABLIST TESTS

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import type { LeaderboardMode } from "../../foundation/model/leaderboard-foundation.types";
import { LeaderboardModeTabs } from "./LeaderboardModeTabs";

function Harness() {
  const [mode, setMode] = useState<LeaderboardMode>("weekly");
  return <LeaderboardModeTabs activeMode={mode} onSelect={setMode} />;
}

describe("LeaderboardModeTabs", () => {
  it("maintains one tab stop and activates adjacent modes with arrow keys", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const weekly = screen.getByRole("tab", { name: "Weekly" });
    const pools = screen.getByRole("tab", { name: "Pools" });

    expect(weekly).toHaveAttribute("tabindex", "0");
    expect(pools).toHaveAttribute("tabindex", "-1");

    weekly.focus();
    await user.keyboard("{ArrowRight}");

    expect(pools).toHaveFocus();
    expect(pools).toHaveAttribute("aria-selected", "true");
    expect(pools).toHaveAttribute("tabindex", "0");
    expect(weekly).toHaveAttribute("tabindex", "-1");
  });

  it("supports Home and End navigation", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const weekly = screen.getByRole("tab", { name: "Weekly" });
    weekly.focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Combine" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(weekly).toHaveFocus();
  });
});
