import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TypographyPreviewPage from "./page";

describe("TypographyPreviewPage", () => {
  it("renders the approved reference composition", () => {
    render(<TypographyPreviewPage />);

    const displayHeading = screen.getByRole("heading", {
      name: /every game is a verzus/i,
    });

    const referenceCopy = displayHeading.closest("div");

    expect(referenceCopy).not.toBeNull();

    expect(within(referenceCopy as HTMLElement).getByText("2,310")).toBeInTheDocument();

    expect(screen.getByText("40px / 700 / uppercase")).toBeInTheDocument();

    expect(screen.getByText("28px / 700 / tabular")).toBeInTheDocument();
  });

  it("renders the complete shared hierarchy", () => {
    render(<TypographyPreviewPage />);

    expect(screen.getByText("Display XL")).toBeInTheDocument();
    expect(screen.getByText("Heading LG")).toBeInTheDocument();
    expect(screen.getByText("Body MD")).toBeInTheDocument();
    expect(screen.getByText("Numeric LG")).toBeInTheDocument();
    expect(screen.getByText("Label CAP")).toBeInTheDocument();
  });

  it("renders a current-player ranking example", () => {
    render(<TypographyPreviewPage />);

    const currentPlayerPoints = screen.getByText("721");
    const currentPlayerRow = currentPlayerPoints.closest("article");

    expect(currentPlayerRow).not.toBeNull();

    const scopedRow = within(currentPlayerRow as HTMLElement);

    expect(scopedRow.getByText("JAYFLEX")).toBeInTheDocument();
    expect(scopedRow.getByText("721")).toBeInTheDocument();
    expect(scopedRow.getByText("▲ 1")).toBeInTheDocument();
    expect(scopedRow.getByText("18W–4L")).toBeInTheDocument();
  });
});
