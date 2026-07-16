import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SearchScreen } from "./SearchScreen";

describe("SearchScreen", () => {
  it("renders the global competitive search form", () => {
    render(<SearchScreen />);

    expect(screen.getByRole("heading", { level: 1, name: "SEARCH VERZUS" })).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "Search the competitive network" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Island Elites")).toBeInTheDocument();
  });
});
