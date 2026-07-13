import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import MatchCompetitionPreviewPage from "./page";

describe("MatchCompetitionPreviewPage", () => {
  it("renders competition and match primitives", () => {
    render(<MatchCompetitionPreviewPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Match and Competition Operations" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "VERZUS Weekly Open competition" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "JAYFLEX versus R3DSTORM" })).toBeInTheDocument();
  });

  it("opens the entry modal and operations drawer", async () => {
    const user = userEvent.setup();
    render(<MatchCompetitionPreviewPage />);

    await user.click(screen.getByRole("button", { name: "Enter competition" }));
    expect(screen.getByRole("dialog", { name: "Enter VERZUS Weekly Open" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));
    await user.click(screen.getByRole("button", { name: "Open operations" }));
    expect(screen.getByRole("dialog", { name: "Match operations" })).toBeInTheDocument();
  });
});
