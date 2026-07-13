import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AvatarGroup } from "./AvatarGroup";

const members = [
  { id: "1", name: "Jay Flex", tone: "green" as const },
  { id: "2", name: "Red Storm", tone: "red" as const },
  { id: "3", name: "Nova King", tone: "cyan" as const },
  { id: "4", name: "Kemi Strike", tone: "gold" as const },
  { id: "5", name: "Arc Wolf", tone: "violet" as const },
];

describe("AvatarGroup", () => {
  it("summarizes members while limiting the visible stack", () => {
    render(<AvatarGroup items={members} label="Night Ravens members" max={3} />);

    const group = screen.getByRole("group", { name: "Night Ravens members" });

    expect(group).toHaveAttribute("data-avatar-group-count", "5");
    expect(group).toHaveTextContent("Jay Flex, Red Storm, Nova King, Kemi Strike, Arc Wolf");
    expect(group).toHaveTextContent("+2");
  });

  it("clamps an invalid maximum to one visible avatar", () => {
    render(<AvatarGroup items={members} max={0} />);

    expect(screen.getByRole("group", { name: "5 members" })).toHaveTextContent("+4");
  });
});
