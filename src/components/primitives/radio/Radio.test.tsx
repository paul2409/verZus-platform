import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";

describe("RadioGroup", () => {
  it("groups radio controls under one accessible label", () => {
    render(
      <RadioGroup label="Preferred game">
        <Radio label="EA FC" value="ea-fc" />
        <Radio label="Call of Duty" value="cod" />
      </RadioGroup>,
    );

    expect(
      screen.getByRole("group", {
        name: "Preferred game",
      }),
    ).toBeInTheDocument();
  });

  it("allows one option to be selected", async () => {
    const user = userEvent.setup();

    render(
      <RadioGroup label="Preferred game">
        <Radio label="EA FC" value="ea-fc" />
        <Radio label="Call of Duty" value="cod" />
      </RadioGroup>,
    );

    const eaFc = screen.getByRole("radio", {
      name: "EA FC",
    });

    const cod = screen.getByRole("radio", {
      name: "Call of Duty",
    });

    await user.click(eaFc);
    expect(eaFc).toBeChecked();

    await user.click(cod);
    expect(cod).toBeChecked();
    expect(eaFc).not.toBeChecked();
  });
});
