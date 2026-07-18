// VERZUS M9.1 CREWS ROUTE WRAPPER TEST
// VERZUS M9.2 MEMBERSHIP-AWARE ROUTING TESTS

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { defaultCrewDiscoveryQuery } from "../discovery";
import { CrewsScreen } from "./CrewsScreen";

vi.mock("next/navigation", () => ({
  usePathname: () => "/crews",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("CrewsScreen", () => {
  it("preserves the M9.1 profile for a current member", () => {
    render(<CrewsScreen discoveryQuery={defaultCrewDiscoveryQuery} />);

    expect(screen.getByRole("heading", { name: "Xenon Esports" })).toBeVisible();
    expect(screen.getByText("M9.1 READ-ONLY FOUNDATION")).toBeVisible();
  });

  it("routes a player without a Crew to the no-Crew state", () => {
    render(
      <CrewsScreen discoveryQuery={defaultCrewDiscoveryQuery} membership="none" view="profile" />,
    );

    expect(
      screen.getByRole("heading", { name: "Find a Crew that matches how you play" }),
    ).toBeVisible();
  });

  it("routes discovery URL state to the discovery surface", () => {
    render(<CrewsScreen discoveryQuery={defaultCrewDiscoveryQuery} view="discover" />);

    expect(screen.getByRole("heading", { name: "Find your next competitive Crew" })).toBeVisible();
  });
});
