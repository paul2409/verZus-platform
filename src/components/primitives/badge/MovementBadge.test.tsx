import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MovementBadge } from "./MovementBadge";

describe("MovementBadge", () => {
  it.each([
    ["increased", 3, "Ranking increased 3"],
    ["decreased", 2, "Ranking decreased 2"],
    ["unchanged", undefined, "Ranking unchanged"],
    ["new", undefined, "New ranking entry"],
    ["unranked", undefined, "Unranked"],
  ] as const)("renders %s movement accessibly", (movement, value, label) => {
    render(<MovementBadge movement={movement} {...(value === undefined ? {} : { value })} />);

    expect(screen.getByLabelText(label)).toHaveAttribute("data-movement", movement);
  });
});
