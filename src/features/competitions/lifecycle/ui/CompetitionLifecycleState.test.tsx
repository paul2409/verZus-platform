import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { CompetitionLifecycleResource } from "../model/competition-lifecycle.types";
import { CompetitionLifecycleState } from "./CompetitionLifecycleState";

const resource: CompetitionLifecycleResource = {
  competitionId: "ea-fc-rookie-cup",
  lifecycle: "registration_closed",
  scenario: "registration_closed",
  disposition: "registration_closed",
  title: "REGISTRATION CLOSED",
  message: "The registration deadline has passed.",
  severity: "warning",
  primaryAction: "view_schedule",
  entryAllowed: false,
  waitlistAllowed: false,
  blocking: false,
  retryable: false,
  registeredCount: 256,
  capacity: 256,
  meta: {
    requestId: "request-1",
    serverNow: "2026-07-16T20:00:00.000Z",
    lastUpdatedAt: "2026-07-16T20:00:00.000Z",
    freshness: "fresh",
  },
};

describe("CompetitionLifecycleState", () => {
  it("renders registration closed without removing navigation", () => {
    render(
      <CompetitionLifecycleState
        competitionId={resource.competitionId}
        resource={resource}
        scenario="registration_closed"
      />,
    );

    expect(screen.getByRole("heading", { name: "REGISTRATION CLOSED" })).toBeVisible();
    expect(screen.getByRole("link", { name: "VIEW SCHEDULE" })).toHaveAttribute(
      "href",
      "#schedule",
    );
  });

  it("renders waitlist as a distinct non-entry outcome", () => {
    render(
      <CompetitionLifecycleState
        competitionId={resource.competitionId}
        resource={{
          ...resource,
          scenario: "waitlist",
          disposition: "waitlist_available",
          title: "COMPETITION FULL — WAITLIST OPEN",
          primaryAction: "view_waitlist",
          waitlistAllowed: true,
        }}
        scenario="waitlist"
      />,
    );

    expect(screen.getByRole("link", { name: "VIEW WAITLIST" })).toBeVisible();
  });

  it("exposes retry for an offline resource failure", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <CompetitionLifecycleState
        competitionId={resource.competitionId}
        error={{
          code: "offline",
          message: "Reconnect before entering.",
          requestId: "offline-1",
          retryable: true,
        }}
        onRetry={onRetry}
        scenario="offline"
      />,
    );

    await user.click(screen.getByRole("button", { name: "RETRY" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByText("REFERENCE offline-1")).toBeVisible();
  });

  it("does not render a banner for the normal entry-open state", () => {
    const { container } = render(
      <CompetitionLifecycleState
        competitionId={resource.competitionId}
        resource={{
          ...resource,
          lifecycle: "registration_open",
          scenario: "normal",
          disposition: "entry_open",
          title: "REGISTRATION OPEN",
          primaryAction: "none",
          entryAllowed: true,
        }}
        scenario="normal"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
