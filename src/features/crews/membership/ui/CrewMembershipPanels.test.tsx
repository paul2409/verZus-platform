// VERZUS M9.5 CREW MEMBERSHIP PANEL TESTS

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { CrewMembershipSnapshot } from "../model/crew-membership.types";
import { CrewMembershipRequestsPanel, CrewMembershipSettingsPanel } from "./CrewMembershipPanels";

const snapshot: CrewMembershipSnapshot = {
  crewId: "crew-xenon-esports",
  version: 1,
  capacity: 30,
  memberCount: 25,
  serverNow: "2026-07-18T09:00:00.000Z",
  viewer: {
    playerId: "player-prismo",
    playerName: "Prismo",
    handle: "@prismo",
    crewId: "crew-xenon-esports",
    role: "owner",
    joinedAt: "2024-11-18T12:00:00.000Z",
  },
  applications: [
    {
      id: "application-1",
      crewId: "crew-xenon-esports",
      playerId: "player-nova",
      playerName: "Nova",
      handle: "@nova",
      game: "EA FC",
      trust: 94,
      message: "Ready to compete.",
      status: "pending",
      createdAt: "2026-07-18T08:00:00.000Z",
      expiresAt: "2026-07-25T08:00:00.000Z",
      decidedAt: null,
      decidedBy: null,
    },
  ],
  invites: [],
  auditEvents: [],
};

function renderWithQuery(ui: React.ReactNode) {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {ui}
    </QueryClientProvider>,
  );
}

describe("Crew membership panels", () => {
  it("renders application decisions and invite creation", () => {
    renderWithQuery(<CrewMembershipRequestsPanel snapshot={snapshot} />);
    expect(screen.getByRole("heading", { name: "Applications and invites" })).toBeVisible();
    expect(screen.getByText("Nova")).toBeVisible();
    expect(screen.getByRole("button", { name: "Accept" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Send invite" })).toBeEnabled();
  });

  it("blocks owner leave until ownership transfer", () => {
    renderWithQuery(<CrewMembershipSettingsPanel snapshot={snapshot} />);
    expect(screen.getByRole("button", { name: "Leave Crew" })).toBeDisabled();
    expect(screen.getByText(/transfer ownership/i)).toBeVisible();
  });
});
