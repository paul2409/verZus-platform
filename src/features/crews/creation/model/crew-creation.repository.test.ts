// VERZUS M9.3 LOCAL CREW CREATION REPOSITORY TESTS

import { describe, expect, it } from "vitest";

import { createInitialCrewCreationDraft } from "./crew-creation.types";
import {
  createCrewRecord,
  createEmptyCrewCreationState,
  loadCrewCreationState,
  saveCrewCreationState,
  type CrewCreationStorage,
} from "./crew-creation.repository";

function createMemoryStorage(): CrewCreationStorage {
  const entries = new Map<string, string>();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key),
  };
}

describe("Crew creation repository", () => {
  it("persists a versioned draft", () => {
    const storage = createMemoryStorage();
    const state = createEmptyCrewCreationState("submission-123456");
    state.draft.name = "Night Shift";

    saveCrewCreationState(storage, state);

    expect(loadCrewCreationState(storage).draft.name).toBe("Night Shift");
  });

  it("creates a forming Crew with an owner", () => {
    const draft = createInitialCrewCreationDraft("submission-ABC123");
    Object.assign(draft, {
      name: "Night Shift Elite",
      tag: "NSE",
      description: "A disciplined late-night Crew for verified competitive play.",
    });

    const record = createCrewRecord(draft, new Date("2026-07-17T18:00:00.000Z"), null);

    expect(record).toEqual(
      expect.objectContaining({
        lifecycle: "forming",
        memberCount: 1,
        owner: expect.objectContaining({ role: "owner" }),
      }),
    );
  });

  it("returns the same record for a repeated submission id", () => {
    const draft = createInitialCrewCreationDraft("submission-ABC123");
    Object.assign(draft, {
      name: "Night Shift Elite",
      tag: "NSE",
      description: "A disciplined late-night Crew for verified competitive play.",
    });
    const first = createCrewRecord(draft, new Date("2026-07-17T18:00:00.000Z"), null);
    const replay = createCrewRecord(draft, new Date("2026-07-17T19:00:00.000Z"), first);

    expect(replay).toBe(first);
  });
});
