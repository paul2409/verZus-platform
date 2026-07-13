import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CrewIdentity } from "./CrewIdentity";

describe("CrewIdentity", () => {
  it("renders Crew identity with tag, members and metadata", () => {
    render(
      <CrewIdentity
        memberCount={24}
        metadata="Rank #3"
        name="Night Ravens"
        subtitle="Precision division"
        tag="NRV"
        verified
      />,
    );

    expect(screen.getByText("Night Ravens")).toBeInTheDocument();
    expect(screen.getByText("[NRV]")).toBeInTheDocument();
    expect(screen.getByText("Precision division")).toBeInTheDocument();
    expect(screen.getByText("24 members")).toBeInTheDocument();
    expect(screen.getByText("Rank #3")).toBeInTheDocument();
  });

  it("uses singular member wording", () => {
    render(<CrewIdentity memberCount={1} name="Solo Crew" />);

    expect(screen.getByText("1 member")).toBeInTheDocument();
  });
});
