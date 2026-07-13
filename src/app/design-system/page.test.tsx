import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DesignSystemPage from "./page";
import { galleryGroups, supportedStates, viewportChecks } from "./gallery-data";

describe("DesignSystemPage", () => {
  it("renders the unified Step 17 gallery", () => {
    render(<DesignSystemPage />);

    expect(
      screen.getByRole("heading", { name: "Unified Design-System Gallery", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Live shared primitives")).toBeInTheDocument();
    expect(screen.getByText("Supported state matrix")).toBeInTheDocument();
    expect(screen.getByText("Responsive approval matrix")).toBeInTheDocument();
  });

  it("links every dedicated preview route", () => {
    render(<DesignSystemPage />);

    const previews = galleryGroups.flatMap((group) => group.previews);

    expect(previews).toHaveLength(16);

    for (const preview of previews) {
      expect(screen.getByRole("link", { name: `Open ${preview.title} preview` })).toHaveAttribute(
        "href",
        preview.href,
      );
    }
  });

  it("documents every required state and responsive width", () => {
    render(<DesignSystemPage />);

    for (const [state] of supportedStates) {
      expect(screen.getByText(state)).toBeInTheDocument();
    }

    for (const [width] of viewportChecks) {
      expect(screen.getByText(width)).toBeInTheDocument();
    }
  });
});
