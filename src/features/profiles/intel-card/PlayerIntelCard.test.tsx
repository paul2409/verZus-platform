import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlayerIntelCard } from "./PlayerIntelCard";
import { playerIntelMock } from "./player-intel.mock";

describe("PlayerIntelCard", () => {
  it("renders the approved player snapshot hierarchy", () => {
    render(<PlayerIntelCard model={playerIntelMock} />);

    expect(screen.getByRole("article", { name: "Player intel for JAYFLEX" })).toBeInTheDocument();
    expect(screen.getByText("77.4%")).toBeVisible();
    expect(screen.getByText("2,310")).toBeVisible();
    expect(screen.getByRole("link", { name: "View full profile" })).toHaveAttribute(
      "href",
      playerIntelMock.profileHref,
    );
  });

  it("discloses partial data without removing validated metrics", () => {
    render(<PlayerIntelCard model={playerIntelMock} state="partial" />);

    expect(screen.getByText("Partial intel")).toBeVisible();
    expect(screen.getByText("2,310")).toBeVisible();
  });
});
