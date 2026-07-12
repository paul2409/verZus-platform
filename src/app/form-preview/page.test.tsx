import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FormPreviewPage from "./page";

describe("FormPreviewPage", () => {
  it("renders the core text controls", () => {
    render(<FormPreviewPage />);

    expect(screen.getByLabelText("Player username")).toBeInTheDocument();

    expect(screen.getByLabelText("Search players")).toBeInTheDocument();

    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders selection controls", () => {
    render(<FormPreviewPage />);

    expect(screen.getByLabelText("Primary game")).toHaveValue("ea-fc");

    expect(
      screen.getByRole("group", {
        name: "Preferred competition format",
      }),
    ).toBeInTheDocument();
  });

  it("renders accessible checkbox and switch controls", () => {
    render(<FormPreviewPage />);

    expect(
      screen.getByRole("checkbox", {
        name: "I accept the competition rules",
      }),
    ).toBeChecked();

    expect(
      screen.getByRole("switch", {
        name: "Match reminders",
      }),
    ).toBeChecked();
  });

  it("renders invalid and disabled states", () => {
    render(<FormPreviewPage />);

    expect(screen.getByLabelText("Unavailable username")).toHaveAttribute("aria-invalid", "true");

    expect(screen.getByLabelText("Crew code")).toBeDisabled();
  });
});
