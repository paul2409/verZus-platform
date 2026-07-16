import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfileScreen } from "./ProfileScreen";

describe("ProfileScreen", () => {
  it("renders player identity and competitive score", () => {
    render(<ProfileScreen />);

    expect(screen.getByRole("heading", { level: 1, name: "JAYFLEX" })).toBeInTheDocument();
    expect(screen.getByText("2,310")).toBeInTheDocument();
    expect(screen.getAllByText("Mainland Titans")).toHaveLength(2);
  });
});
