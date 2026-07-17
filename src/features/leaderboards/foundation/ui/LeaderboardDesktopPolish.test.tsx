// VERZUS M8.10.2 DESKTOP LEADERBOARD POLISH TESTS

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LeaderboardFoundationScreen } from "./LeaderboardFoundationScreen";

vi.mock("next/navigation", () => ({
  usePathname: () => "/leaderboards/weekly",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("M8.10.2 desktop leaderboard polish", () => {
  it("defaults to ten rows and exposes explicit Player, Crew and Match intel links", () => {
    render(<LeaderboardFoundationScreen initialSearchParams={{ mode: "weekly" }} />);

    expect(screen.getByLabelText("Rows per page")).toHaveValue("10");

    const table = screen.getByRole("table");
    expect(
      within(table).getByRole("link", { name: /Open Prismo player intel card/i }),
    ).toBeVisible();
    expect(
      within(table).getAllByRole("link", { name: /Open Xenon crew intel card/i }).length,
    ).toBeGreaterThan(0);
    expect(
      within(table).getAllByRole("link", { name: /Open .* match intel card/i }).length,
    ).toBeGreaterThan(0);
  });

  it("marks mode-owned columns for deterministic width composition", () => {
    const { container } = render(
      <LeaderboardFoundationScreen initialSearchParams={{ mode: "crew" }} />,
    );

    expect(container.querySelector('th[data-column="identity"]')).toBeInTheDocument();
    expect(container.querySelector('td[data-column="members"]')).toBeInTheDocument();
    expect(container.querySelector('td[data-column="recent-match"]')).toBeInTheDocument();
    expect(container.querySelector('tbody[data-desktop-pinned="true"]')).toBeInTheDocument();
  });
});
