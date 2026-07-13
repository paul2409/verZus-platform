// VERZUS M3 STEP 3.8

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import M3PreviewPage from "./page";

describe("M3 approval centre", () => {
  it("links every M3 preview and production shell route", () => {
    render(<M3PreviewPage />);

    expect(
      screen.getByRole("heading", {
        name: "Application Shell Approval Centre",
      }),
    ).toBeVisible();

    const expectedRoutes = [
      "/shell-preview",
      "/navigation-states-preview",
      "/route-boundaries-preview",
      "/widget-boundaries-preview",
      "/shell-overlays-preview",
      "/m3-shell-audit",
      "/play",
    ];

    for (const href of expectedRoutes) {
      expect(document.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });

  it("shows the complete responsive approval set", () => {
    render(<M3PreviewPage />);

    for (const width of ["360px", "390px", "430px", "768px", "1024px", "1440px"]) {
      expect(screen.getByText(new RegExp(width))).toBeVisible();
    }

    expect(screen.getByText("npm run verify:m3")).toBeVisible();
  });
});
