import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders an accessible checkbox", () => {
    render(
      <Checkbox
        description="Required before entering ranked play."
        label="Accept competition rules"
      />,
    );

    expect(
      screen.getByRole("checkbox", {
        name: "Accept competition rules",
      }),
    ).toHaveAccessibleDescription("Required before entering ranked play.");
  });

  it("can be checked", async () => {
    const user = userEvent.setup();

    render(<Checkbox label="Enable notifications" />);

    const checkbox = screen.getByRole("checkbox", {
      name: "Enable notifications",
    });

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("supports an indeterminate state", () => {
    render(<Checkbox indeterminate label="Select visible players" />);

    expect(
      screen.getByRole("checkbox", {
        name: "Select visible players",
      }),
    ).toHaveAttribute("aria-checked", "mixed");
  });
});
