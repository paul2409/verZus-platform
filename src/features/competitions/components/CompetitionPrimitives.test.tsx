import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { competitionPreviewMock } from "../mocks/competition.mock";
import { CompetitionStatus, CompetitionSummary, EligibilityStatus } from "./CompetitionPrimitives";

describe("competition primitives", () => {
  it("maps lifecycle and eligibility states", () => {
    render(
      <>
        <CompetitionStatus status="check-in-open" />
        <EligibilityStatus state="ineligible" />
      </>,
    );

    expect(screen.getByText("Check-in open").closest("[data-competition-status]")).toHaveAttribute(
      "data-competition-status",
      "check-in-open",
    );
    expect(screen.getByText("Not eligible").closest("div")).toHaveAttribute(
      "data-eligibility-state",
      "ineligible",
    );
  });

  it("renders a complete competition summary", () => {
    render(
      <CompetitionSummary
        actions={<button type="button">Enter competition</button>}
        competition={competitionPreviewMock}
      />,
    );

    expect(
      screen.getByRole("article", { name: "VERZUS Weekly Open competition" }),
    ).toBeInTheDocument();
    expect(screen.getByText("₦250,000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enter competition" })).toBeInTheDocument();
  });
});
