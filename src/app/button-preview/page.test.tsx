import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ButtonPreviewPage from "./page";

describe("ButtonPreviewPage", () => {
  it("renders the approved button variants", () => {
    render(<ButtonPreviewPage />);

    expect(
      screen.getByRole("button", {
        name: "Check in now",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "View card",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Report issue",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Dismiss",
      }),
    ).toBeInTheDocument();
  });

  it("renders accessible operational states", () => {
    render(<ButtonPreviewPage />);

    expect(
      screen.getByRole("button", {
        name: "Check-in closed",
      }),
    ).toBeDisabled();

    const loadingButton = screen.getByRole("button", {
      name: "Checking in",
    });

    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute("aria-busy", "true");
  });

  it("renders the match action group", () => {
    render(<ButtonPreviewPage />);

    const group = screen.getByRole("group", {
      name: "Match actions",
    });

    expect(
      within(group).getByRole("button", {
        name: "Check in",
      }),
    ).toBeInTheDocument();

    expect(
      within(group).getByRole("button", {
        name: "Submit result",
      }),
    ).toBeInTheDocument();

    expect(
      within(group).getByRole("button", {
        name: "Dispute match",
      }),
    ).toBeInTheDocument();
  });

  it("renders the full-width mobile action", () => {
    render(<ButtonPreviewPage />);

    expect(
      screen.getByRole("button", {
        name: "Enter competition",
      }),
    ).toHaveAttribute("data-button-size", "lg");
  });
});
