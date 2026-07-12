import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FormField } from "../form-field";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders a labelled textarea", () => {
    render(
      <FormField label="Match report">
        <Textarea />
      </FormField>,
    );

    expect(screen.getByLabelText("Match report")).toBeInTheDocument();
  });

  it("accepts typed content", async () => {
    const user = userEvent.setup();

    render(
      <FormField label="Match report">
        <Textarea />
      </FormField>,
    );

    const textarea = screen.getByLabelText("Match report");

    await user.type(textarea, "Opponent disconnected during round two.");

    expect(textarea).toHaveValue("Opponent disconnected during round two.");
  });
});
