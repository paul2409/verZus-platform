import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MatchIntelCard } from "./MatchIntelCard";
import { WarMatchIntelCard } from "./WarMatchIntelCard";
import { matchIntelMock, warMatchIntelMock } from "./match-intel.mock";

describe("Match intel cards", () => {
  it("keeps check-in visible on the Match card", () => {
    render(<MatchIntelCard model={matchIntelMock} />);

    expect(
      screen.getByRole("article", {
        name: "Match intel for MAINLAND TITANS versus LAGOS LYNX",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("18:30")).toBeVisible();
    expect(screen.getByRole("link", { name: "Check in" })).toHaveAttribute(
      "href",
      matchIntelMock.checkInHref,
    );
  });

  it("renders a live War match with independent lane states", () => {
    render(<WarMatchIntelCard model={warMatchIntelMock} />);

    expect(
      screen.getByRole("article", {
        name: "War match intel for MAINLAND TITANS versus LAGOS LYNX",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 - 1")).toBeVisible();
    expect(screen.getByText("Lane 4")).toBeVisible();
    expect(screen.getByRole("link", { name: "View war room" })).toHaveAttribute(
      "href",
      warMatchIntelMock.warHref,
    );
  });

  it("isolates a Match card error", () => {
    render(<MatchIntelCard model={matchIntelMock} state="error" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Intel module failed");
    expect(screen.queryByText("18:30")).not.toBeInTheDocument();
  });
});
