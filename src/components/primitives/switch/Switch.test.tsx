import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Switch } from "./Switch";

describe("Switch", () => {
  it("renders with switch semantics", () => {
    render(<Switch description="Notify me before check-in closes." label="Match reminders" />);

    expect(
      screen.getByRole("switch", {
        name: "Match reminders",
      }),
    ).toHaveAccessibleDescription("Notify me before check-in closes.");
  });

  it("can be toggled", async () => {
    const user = userEvent.setup();

    render(<Switch label="Match reminders" />);

    const control = screen.getByRole("switch", {
      name: "Match reminders",
    });

    await user.click(control);

    expect(control).toBeChecked();
  });
});
