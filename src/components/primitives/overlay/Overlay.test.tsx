import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { Drawer, Modal, Popover, PopoverContent, PopoverTrigger, Tooltip } from ".";

describe("overlay primitives", () => {
  it("connects a tooltip to its trigger", () => {
    render(
      <Tooltip content="Check-in closes in ten minutes">
        <button type="button">Help</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Help" });
    const tooltip = screen.getByRole("tooltip");

    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
  });

  it("opens and closes a popover", async () => {
    const user = userEvent.setup();

    render(
      <Popover>
        <PopoverTrigger>Match details</PopoverTrigger>
        <PopoverContent>Lobby opens at 18:00</PopoverContent>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Match details" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Lobby opens at 18:00");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("traps dialog semantics and closes a modal", async () => {
    const user = userEvent.setup();

    function ModalExample() {
      const [open, setOpen] = useState(true);
      return (
        <Modal onOpenChange={setOpen} open={open} title="Confirm result">
          <button type="button">Submit result</button>
        </Modal>
      );
    }

    render(<ModalExample />);

    const dialog = screen.getByRole("dialog", { name: "Confirm result" });
    expect(dialog).toHaveAttribute("aria-modal", "true");

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders a sided drawer", () => {
    render(
      <Drawer onOpenChange={() => undefined} open side="bottom" title="Match operations">
        Drawer content
      </Drawer>,
    );

    expect(screen.getByRole("dialog", { name: "Match operations" })).toHaveAttribute(
      "data-drawer-side",
      "bottom",
    );
  });
});
