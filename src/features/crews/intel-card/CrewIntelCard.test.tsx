import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CrewIntelCard } from "./CrewIntelCard";
import { crewIntelMock } from "./crew-intel.mock";

describe("CrewIntelCard", () => {
  it("renders Crew identity, trust and competitive metrics", () => {
    render(<CrewIntelCard model={crewIntelMock} />);

    expect(
      screen.getByRole("article", { name: "Crew intel for MAINLAND TITANS" }),
    ).toBeInTheDocument();
    expect(screen.getByText("8,450")).toBeVisible();
    expect(screen.getByText("12 - 3")).toBeVisible();
    expect(screen.getByRole("link", { name: "View crew HQ" })).toHaveAttribute(
      "href",
      crewIntelMock.crewHref,
    );
  });

  it("contains an offline failure inside the Crew card", () => {
    render(<CrewIntelCard model={crewIntelMock} state="offline" />);

    expect(screen.getByRole("status")).toHaveTextContent("Intel unavailable offline");
    expect(screen.getByRole("link", { name: "Open crew profile" })).toBeVisible();
  });
});
