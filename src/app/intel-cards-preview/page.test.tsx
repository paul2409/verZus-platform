import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import IntelCardsPreviewPage from "./page";

describe("IntelCardsPreviewPage", () => {
  it("renders all four approved Intel card families", () => {
    render(<IntelCardsPreviewPage />);

    expect(screen.getByRole("heading", { name: "Intel Cards", level: 1 })).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(8);
    expect(screen.getByText("Four production card families")).toBeVisible();
    expect(screen.getByText("Supported card states")).toBeVisible();
  });
});
