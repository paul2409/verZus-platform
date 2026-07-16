import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CrewsScreen } from "./CrewsScreen";

describe("CrewsScreen", () => {
  it("renders the Crew HQ and opens the Island Elites intel dialog", () => {
    render(<CrewsScreen />);

    expect(screen.getByRole("heading", { name: "Mainland Titans" })).toBeVisible();
    expect(screen.getByText(/War week active/i)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Open crew intel" }));

    expect(screen.getByRole("dialog", { name: /Island Elites/i })).toBeVisible();
    expect(screen.getByText("License tracker")).toBeVisible();
  });
});
