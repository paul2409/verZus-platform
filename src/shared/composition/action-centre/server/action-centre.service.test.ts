import { describe, expect, it } from "vitest";

import type { ActionCentreItem } from "@/lib/actions";

import { rankActionCentreItems } from "./action-centre.service";

function action(overrides: Partial<ActionCentreItem> = {}): ActionCentreItem {
  return {
    id: "action-1",
    kind: "profile_readiness",
    label: "ACTION",
    detail: "DETAIL",
    reason: "REASON",
    href: "/profile/edit",
    actionLabel: "OPEN",
    priority: "normal",
    tone: "info",
    score: 50,
    deadlineAt: null,
    sourceType: "profile",
    sourceId: "user-1",
    ...overrides,
  };
}

describe("rankActionCentreItems", () => {
  it("orders higher urgency first", () => {
    const items = rankActionCentreItems([
      action({ id: "normal", score: 50, sourceId: "normal" }),
      action({ id: "critical", score: 120, sourceId: "critical", priority: "critical" }),
    ]);
    expect(items.map((item) => item.id)).toEqual(["critical", "normal"]);
  });

  it("deduplicates the same domain task", () => {
    const items = rankActionCentreItems([
      action({ id: "old", score: 50 }),
      action({ id: "new", score: 80 }),
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe("new");
  });

  it("caps the action stream at six", () => {
    const items = rankActionCentreItems(
      Array.from({ length: 9 }, (_, index) =>
        action({ id: `action-${index}`, sourceId: `source-${index}`, score: 100 - index }),
      ),
    );
    expect(items).toHaveLength(6);
  });
});
