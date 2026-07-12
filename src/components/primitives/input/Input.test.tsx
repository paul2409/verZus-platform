import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FormField } from "../form-field";
import { Input } from "./Input";
import { PasswordInput } from "./PasswordInput";
import { SearchInput } from "./SearchInput";

describe("Input controls", () => {
  it("renders a labelled input", () => {
    render(
      <FormField label="Email address">
        <Input type="email" />
      </FormField>,
    );

    expect(screen.getByLabelText("Email address")).toHaveAttribute("type", "email");
  });

  it("renders a search input with a search icon", () => {
    const { container } = render(
      <FormField label="Search players">
        <SearchInput />
      </FormField>,
    );

    expect(screen.getByLabelText("Search players")).toHaveAttribute("type", "search");

    expect(container.querySelector('[data-icon="search"]')).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();

    render(
      <FormField label="Password">
        <PasswordInput />
      </FormField>,
    );

    const input = screen.getByLabelText("Password");

    expect(input).toHaveAttribute("type", "password");

    await user.click(
      screen.getByRole("button", {
        name: "Show password",
      }),
    );

    expect(input).toHaveAttribute("type", "text");

    await user.click(
      screen.getByRole("button", {
        name: "Hide password",
      }),
    );

    expect(input).toHaveAttribute("type", "password");
  });

  it("supports read-only fields", () => {
    render(
      <FormField label="Player ID">
        <Input readOnly value="VZ-2048" />
      </FormField>,
    );

    expect(screen.getByLabelText("Player ID")).toHaveAttribute("readonly");
  });
});
