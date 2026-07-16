import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { IntelCardProvider } from "@/components/primitives/intel-card";

import { CompetitionDiscoveryScreen } from "./CompetitionDiscoveryScreen";

describe("CompetitionDiscoveryScreen", () => {
  it("renders compete hub with matches, leaderboards and watch tabs", async () => {
    const user = userEvent.setup();
    render(
      <IntelCardProvider>
        <CompetitionDiscoveryScreen />
      </IntelCardProvider>,
    );

    expect(screen.getByRole("heading", { name: "COMPETE" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "QUALIFIERS" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "LEADERBOARDS" }));
    expect(screen.getByRole("heading", { name: "LEADERBOARDS" })).toBeVisible();
    expect(screen.getByRole("link", { name: /OPEN FULL RANKINGS/i })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "WATCH" }));
    expect(screen.getByRole("heading", { name: "WATCH" })).toBeVisible();
  });
});
