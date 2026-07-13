import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { matchPreviewMock } from "../mocks/match.mock";
import {
  BracketNode,
  CheckInAction,
  MatchIdentity,
  MatchStatus,
  MatchTimelineStep,
  ResultStatus,
} from "./MatchPrimitives";

describe("match primitives", () => {
  it("maps lifecycle and result states", () => {
    render(
      <>
        <MatchStatus status="lobby-open" />
        <ResultStatus state="draw" />
      </>,
    );

    expect(screen.getByText("Lobby open").closest("[data-match-status]")).toHaveAttribute(
      "data-match-status",
      "lobby-open",
    );
    expect(screen.getByText("Draw").closest("[data-result-state]")).toHaveAttribute(
      "data-result-state",
      "draw",
    );
  });

  it("renders participant versus composition and check-in action", () => {
    render(
      <MatchIdentity actions={<CheckInAction state="available" />} match={matchPreviewMock} />,
    );

    expect(screen.getByRole("region", { name: "JAYFLEX versus R3DSTORM" })).toBeInTheDocument();
    expect(screen.getByText("VS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check in now" })).toBeEnabled();
  });

  it("renders timeline and bracket states", () => {
    render(
      <>
        <ol>
          <MatchTimelineStep label="Check-in" state="complete" />
          <MatchTimelineStep label="Play match" state="current" />
        </ol>
        <BracketNode
          active
          away={matchPreviewMock.away}
          home={matchPreviewMock.home}
          label="Semi-final A"
          winnerId={matchPreviewMock.home.id}
        />
      </>,
    );

    expect(screen.getByText("Check-in").closest("li")).toHaveAttribute(
      "data-timeline-state",
      "complete",
    );
    expect(screen.getByRole("article", { name: "Semi-final A" })).toHaveAttribute(
      "data-bracket-active",
      "true",
    );
  });
});
