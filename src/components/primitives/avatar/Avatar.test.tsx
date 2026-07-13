import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("renders accessible initials when no image is available", () => {
    render(<Avatar name="Jay Flex" presence="online" verified />);

    const avatar = screen.getByRole("img", {
      name: "Jay Flex avatar, verified, online",
    });

    expect(avatar).toHaveTextContent("JF");
    expect(avatar).toHaveAttribute("data-avatar-presence", "online");
    expect(avatar).toHaveAttribute("data-avatar-verified", "true");
  });

  it("falls back to initials after an image error", () => {
    const { container } = render(
      <Avatar alt="Jay Flex" name="Jay Flex" src="/missing-avatar.png" />,
    );

    const image = container.querySelector("img");
    expect(image).toBeInTheDocument();

    fireEvent.error(image as HTMLImageElement);

    expect(screen.getByRole("img", { name: "Jay Flex avatar" })).toHaveTextContent("JF");
  });

  it("supports loading and suspended states", () => {
    render(<Avatar loading name="Restricted Player" suspended tone="red" />);

    const avatar = screen.getByRole("img", {
      name: "Restricted Player avatar, suspended",
    });

    expect(avatar).toHaveAttribute("data-avatar-loading", "true");
    expect(avatar).toHaveAttribute("data-avatar-suspended", "true");
    expect(avatar).toHaveAttribute("data-avatar-tone", "red");
  });

  it("can be decorative without duplicating nearby identity text", () => {
    render(<Avatar decorative name="Jay Flex" />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
