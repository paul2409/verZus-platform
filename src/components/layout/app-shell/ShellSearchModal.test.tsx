// VERZUS M3 STEP 3.6

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ShellSearchModal } from "./ShellSearchModal";

describe("ShellSearchModal", () => {
  it("renders a real GET search form and domain shortcuts", () => {
    render(<ShellSearchModal onOpenChange={vi.fn()} open />);

    const search = screen.getByRole("searchbox", { name: "Search query" });
    const form = search.closest("form");

    expect(form).toHaveAttribute("action", "/search");
    expect(form).toHaveAttribute("method", "get");
    expect(screen.getByRole("link", { name: /players/i })).toHaveAttribute(
      "href",
      "/search?domain=players",
    );
  });

  it("keeps submission disabled until a query exists", () => {
    render(<ShellSearchModal onOpenChange={vi.fn()} open />);

    const submit = screen.getByRole("button", { name: "Search" });

    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search query" }), {
      target: { value: "Jayflex" },
    });

    expect(submit).toBeEnabled();
  });
});
