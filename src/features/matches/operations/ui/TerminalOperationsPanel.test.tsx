// VERZUS M7.7 TERMINAL OPERATIONS PANEL TESTS

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TerminalOperationsPanel } from "./TerminalOperationsPanel";

vi.mock("../api/match-terminal-api.client", () => ({
  getMatchTerminalSnapshot: vi.fn(async () => ({
    matchId: "match-7",
    seedState: "in-progress",
    state: "in-progress",
    matchVersion: 12,
    terminalReason: null,
    terminalAt: null,
    actorRole: null,
    auditEventId: null,
    terminalEventCount: 0,
    lastUpdatedAt: "2026-07-17T00:00:00.000Z",
    clock: {
      matchId: "match-7",
      state: "in-progress",
      matchVersion: 12,
      serverNow: "2026-07-17T00:00:00.000Z",
      issuedAt: "2026-07-17T00:00:00.000Z",
      scheduledAt: "2026-07-17T00:00:00.000Z",
      checkInOpensAt: "2026-07-16T23:20:00.000Z",
      checkInClosesAt: "2026-07-16T23:45:00.000Z",
      lobbyOpensAt: "2026-07-16T23:50:00.000Z",
      matchStartsAt: "2026-07-17T00:00:00.000Z",
      resultDueAt: "2026-07-17T01:00:00.000Z",
      activeDeadlineKind: "match_starts",
      activeDeadlineAt: "2026-07-17T00:00:00.000Z",
      mode: "elapsed",
      timezone: "UTC",
    },
  })),
  mutateMatchTerminal: vi.fn(),
}));

function renderPanel(role: "current_user" | "support" | "admin" | "system") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TerminalOperationsPanel
        currentState="in-progress"
        matchId="match-7"
        matchVersion={12}
        seedState="in-progress"
        viewerRole={role}
      />
    </QueryClientProvider>,
  );
}

describe("TerminalOperationsPanel", () => {
  it("offers forfeit to the current player but not cancellation", async () => {
    renderPanel("current_user");
    expect(await screen.findByRole("button", { name: "Forfeit match" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Cancel match" })).not.toBeInTheDocument();
  });

  it("offers cancellation to an admin", async () => {
    renderPanel("admin");
    expect(await screen.findByRole("button", { name: "Cancel match" })).toBeVisible();
  });
});
