// VERZUS M9.2 CREW DISCOVERY SCREEN TESTS
// VERZUS M9.3 CREW CREATION LINK TEST

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { crewDiscoveryMock } from "../mocks/crew-discovery.mock";
import { defaultCrewDiscoveryQuery } from "../model/crew-discovery.types";
import { CrewDiscoveryScreen } from "./CrewDiscoveryScreen";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/crews",
  useRouter: () => navigation,
}));

describe("CrewDiscoveryScreen", () => {
  it("renders the intentional no-Crew state", () => {
    render(
      <CrewDiscoveryScreen
        crews={crewDiscoveryMock}
        initialQuery={defaultCrewDiscoveryQuery}
        membership="none"
        showNoCrewLanding
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Find a Crew that matches how you play" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Discover Crews" })).toHaveAttribute(
      "href",
      "/crews?view=discover&membership=none",
    );
    expect(screen.getByRole("link", { name: "Create a Crew" })).toHaveAttribute(
      "href",
      "/crews/create?membership=none",
    );
  });

  it("renders deterministic Crew discovery cards", () => {
    render(
      <CrewDiscoveryScreen
        crews={crewDiscoveryMock}
        initialQuery={defaultCrewDiscoveryQuery}
        membership="current"
      />,
    );

    expect(screen.getByRole("heading", { name: "Find your next competitive Crew" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Xenon Esports" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Apex Knights" })).toBeVisible();
    expect(screen.getAllByRole("link", { name: "View profile" })).toHaveLength(6);
  });

  it("renders a deep-linked join-fit review without enabling membership mutation", () => {
    render(
      <CrewDiscoveryScreen
        crews={crewDiscoveryMock}
        initialQuery={{
          ...defaultCrewDiscoveryQuery,
          joinCrewId: "crew-xenon-esports",
        }}
        membership="none"
      />,
    );

    expect(screen.getByRole("dialog", { name: "Xenon Esports" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Send join request" })).toBeDisabled();
  });
});
