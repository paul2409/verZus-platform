import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "../badge";
import { PlayerIdentity } from "./PlayerIdentity";

describe("PlayerIdentity", () => {
  it("renders player identity details without creating a fake control", () => {
    render(
      <PlayerIdentity
        badge={<Badge tone="positive">Verified player</Badge>}
        handle="@jayflex"
        metadata="Rank #4"
        name="Jay Flex"
        presence="online"
        subtitle="Night Ravens"
        trailing={<span>2,430 RP</span>}
        verified
      />,
    );

    expect(screen.getByText("Jay Flex")).toBeInTheDocument();
    expect(screen.getByText("@jayflex")).toBeInTheDocument();
    expect(screen.getByText("Night Ravens")).toBeInTheDocument();
    expect(screen.getByText("Rank #4")).toBeInTheDocument();
    expect(screen.getByText("2,430 RP")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("hides optional descriptive rows in compact mode", () => {
    render(<PlayerIdentity compact metadata="Rank #4" name="Jay Flex" subtitle="Night Ravens" />);

    const identity = screen.getByText("Jay Flex").closest('[data-identity-type="player"]');

    expect(identity).toHaveAttribute("data-identity-compact", "true");
    expect(screen.queryByText("Night Ravens")).not.toBeInTheDocument();
    expect(screen.queryByText("Rank #4")).not.toBeInTheDocument();
  });
});
