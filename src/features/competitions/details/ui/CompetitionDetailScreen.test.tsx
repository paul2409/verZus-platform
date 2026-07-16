import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { competitionDetailMockById } from "../mocks/competition-detail.mock";
import { CompetitionDetailScreen } from "./CompetitionDetailScreen";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("../../entry", () => ({
  CompetitionEntryControl: () => (
    <section aria-label="Competition entry control">ENTER COMPETITION</section>
  ),
}));
vi.mock("../hooks/useCompetitionDetailData", () => ({
  useCompetitionDetailData: () => {
    const detail = competitionDetailMockById["verzus-championship-series"]!;
    const resource = <T,>(value: T) => ({
      state: "success",
      data: {
        value,
        meta: {
          requestId: "test",
          serverNow: "2026-07-16T12:00:00.000Z",
          lastUpdatedAt: "2026-07-16T12:00:00.000Z",
          freshness: "fresh",
        },
      },
      requestId: "test",
      errorCode: null,
      canRetry: true,
    });
    return {
      summary: resource(detail.summary),
      eligibility: resource(detail.eligibility),
      schedule: resource(detail.schedule),
      rewards: resource(detail.rewards),
      rules: resource(detail.rules),
      participants: resource(detail.participants),
      bracket: resource(detail.bracket),
      retrySummary: vi.fn(),
      retryEligibility: vi.fn(),
      retrySchedule: vi.fn(),
      retryRewards: vi.fn(),
      retryRules: vi.fn(),
      retryParticipants: vi.fn(),
      retryBracket: vi.fn(),
    };
  },
}));

describe("CompetitionDetailScreen", () => {
  it("renders every M6.4 detail section and the M6.5 entry boundary", () => {
    render(<CompetitionDetailScreen competitionId="verzus-championship-series" />);
    expect(screen.getByRole("heading", { name: "VERZUS CHAMPIONSHIP SERIES" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "ELIGIBILITY" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "SCHEDULE" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "COMPETITION RULES" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "PARTICIPANTS" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "BRACKET PREVIEW" })).toBeVisible();
    expect(screen.getByLabelText("Competition entry control")).toBeVisible();
  });
});
