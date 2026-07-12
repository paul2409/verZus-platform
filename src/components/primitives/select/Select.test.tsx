import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FormField } from "../form-field";
import { Select } from "./Select";

describe("Select", () => {
  it("renders a labelled select", () => {
    render(
      <FormField label="Game">
        <Select defaultValue="ea-fc">
          <option value="ea-fc">EA FC</option>
          <option value="cod">Call of Duty</option>
        </Select>
      </FormField>,
    );

    expect(screen.getByLabelText("Game")).toHaveValue("ea-fc");
  });

  it("allows the selected value to change", async () => {
    const user = userEvent.setup();

    render(
      <FormField label="Game">
        <Select defaultValue="ea-fc">
          <option value="ea-fc">EA FC</option>
          <option value="cod">Call of Duty</option>
        </Select>
      </FormField>,
    );

    const select = screen.getByLabelText("Game");

    await user.selectOptions(select, "cod");

    expect(select).toHaveValue("cod");
  });
});
