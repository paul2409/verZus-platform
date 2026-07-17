// VERZUS M7.7 MATCH ACCESS STATE TESTS

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MatchAccessStateScreen } from "./MatchAccessStateScreen";

describe("MatchAccessStateScreen", () => {
  it("renders an intentional forbidden state without exposing match data", () => {
    const { container } = render(<MatchAccessStateScreen state="forbidden" />);
    expect(screen.getByRole("heading", { name: "You cannot access this match" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Return to Play" })).toHaveAttribute("href", "/play");
    expect(container.querySelector('[data-access-state="forbidden"]')).toBeTruthy();
  });
});
