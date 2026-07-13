import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "../input";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("connects its label and hint to the control", () => {
    render(
      <FormField hint="Use your public player name." label="Player name">
        <Input />
      </FormField>,
    );

    const input = screen.getByRole("textbox", { name: "Player name" });

    expect(input).toBeInTheDocument();
    expect(input).toHaveAccessibleDescription("Use your public player name.");
  });

  it("marks a control invalid when an error exists", () => {
    render(
      <FormField error="Player name is required." label="Player name" required>
        <Input />
      </FormField>,
    );

    expect(screen.getByRole("textbox", { name: "Player name" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Player name is required.");
  });

  it("disables its child control", () => {
    render(
      <FormField disabled label="Locked field">
        <Input />
      </FormField>,
    );

    expect(screen.getByLabelText("Locked field")).toBeDisabled();
  });
});
