import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import IconPreviewPage from "./page";

describe("IconPreviewPage", () => {
  it("renders the approved operational icon registry", () => {
    render(<IconPreviewPage />);

    expect(screen.getByText("gamepad")).toBeInTheDocument();
    expect(screen.getByText("swords")).toBeInTheDocument();
    expect(screen.getByText("trophy")).toBeInTheDocument();
    expect(screen.getByText("users")).toBeInTheDocument();
  });

  it("renders an accessible standalone icon", () => {
    render(<IconPreviewPage />);

    expect(
      screen.getByRole("img", {
        name: "Accessible trophy sample",
      }),
    ).toBeInTheDocument();
  });

  it("renders accessible icon buttons", () => {
    render(<IconPreviewPage />);

    expect(
      screen.getByRole("button", {
        name: "Open search",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Open notifications",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Report issue",
      }),
    ).toBeInTheDocument();
  });

  it("renders the navigation composition", () => {
    render(<IconPreviewPage />);

    expect(
      screen.getByRole("navigation", {
        name: "Icon system navigation preview",
      }),
    ).toBeInTheDocument();
  });
});
