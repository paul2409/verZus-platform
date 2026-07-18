// VERZUS M9.6 CREW GOVERNANCE COMPONENT TESTS

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getCrewGovernanceForRead } from "../server/crew-governance.service";
import { resetCrewGovernanceStore } from "../server/crew-governance.store";
import { CrewGovernanceRosterPanel, CrewOwnershipTransferPanel } from "./CrewGovernancePanels";

function renderWithQueryClient(node: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
}

describe("Crew governance panels", () => {
  it("shows the protected owner and editable non-owner members", () => {
    resetCrewGovernanceStore();
    const snapshot = getCrewGovernanceForRead("crew-xenon-esports");
    renderWithQueryClient(<CrewGovernanceRosterPanel snapshot={snapshot} />);

    expect(screen.getByRole("heading", { name: /roles and member management/i })).toBeVisible();
    expect(
      screen.getByText(/owner can only change through transactional ownership transfer/i),
    ).toBeVisible();
    expect(screen.getAllByRole("button", { name: /save role/i }).length).toBeGreaterThan(0);
  });

  it("requires explicit ownership-transfer confirmation", () => {
    resetCrewGovernanceStore();
    const snapshot = getCrewGovernanceForRead("crew-xenon-esports");
    renderWithQueryClient(<CrewOwnershipTransferPanel snapshot={snapshot} />);

    expect(screen.getByRole("button", { name: /transfer ownership/i })).toBeDisabled();
    expect(screen.getByLabelText(/ownership transfer confirmation/i)).toBeVisible();
  });
});
