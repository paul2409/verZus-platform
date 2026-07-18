// VERZUS M9.3 CREW CREATION VALIDATION TESTS

import { describe, expect, it } from "vitest";

import { createInitialCrewCreationDraft } from "./crew-creation.types";
import {
  createCrewSlug,
  normalizeCrewTag,
  validateCrewCreationDraft,
} from "./crew-creation.validation";

describe("Crew creation validation", () => {
  it("normalizes a Crew tag to the supported contract", () => {
    expect(normalizeCrewTag(" x-en!23 ")).toBe("XEN23");
  });

  it("rejects incomplete and reserved identity values", () => {
    const draft = createInitialCrewCreationDraft("submission-123456");
    draft.name = "X";
    draft.tag = "ADMIN";
    draft.description = "Too short";

    expect(validateCrewCreationDraft(draft)).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        tag: expect.any(String),
        description: expect.any(String),
      }),
    );
  });

  it("creates a stable Crew slug from name and submission id", () => {
    expect(createCrewSlug("Night Shift Elite", "submission-ABC123")).toBe(
      "crew-night-shift-elite-abc123",
    );
  });
});
