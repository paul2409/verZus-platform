// VERZUS M8.7 WIDGET FAILURE-ISOLATION TESTS

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import type { LeaderboardCrashTarget } from "../model/leaderboard-quality.types";
import { LeaderboardWidgetBoundary } from "./LeaderboardWidgetBoundary";

function Harness() {
  const [target, setTarget] = useState<LeaderboardCrashTarget | null>("rewards");

  return (
    <div>
      <p>Navigation survives</p>
      <LeaderboardWidgetBoundary
        crashTarget={target}
        label="Placement rewards"
        onRecover={() => setTarget(null)}
        target="rewards"
      >
        <p>Rewards restored</p>
      </LeaderboardWidgetBoundary>
    </div>
  );
}

describe("LeaderboardWidgetBoundary", () => {
  it("contains one widget exception and restores it without removing siblings", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByText("Navigation survives")).toBeVisible();
    expect(screen.getByRole("alert", { name: "Placement rewards unavailable" })).toBeVisible();
    expect(screen.queryByText("Rewards restored")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Restore section" }));

    expect(await screen.findByText("Rewards restored")).toBeVisible();
    expect(screen.getByText("Navigation survives")).toBeVisible();
  });
});
