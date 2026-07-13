import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import TabsPreviewPage from "./page";

describe("TabsPreviewPage", () => {
  it("renders the Step 12 gallery", () => {
    render(<TabsPreviewPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Tabs and Segmented Controls",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("tablist", { name: "Player command sections" })).toBeInTheDocument();

    expect(screen.getByRole("radiogroup", { name: "Competition state" })).toBeInTheDocument();
  });

  it("changes the visible player section", async () => {
    const user = userEvent.setup();
    render(<TabsPreviewPage />);

    await user.click(screen.getByRole("tab", { name: /Matches/ }));

    expect(screen.getByRole("heading", { level: 2, name: "Upcoming matches" })).toBeVisible();
  });

  it("changes the controlled competition filter", async () => {
    const user = userEvent.setup();
    render(<TabsPreviewPage />);

    await user.click(screen.getByRole("radio", { name: "Entered" }));

    expect(screen.getByText(/Current competition filter:/)).toHaveTextContent(
      "Current competition filter: entered",
    );
  });
});
