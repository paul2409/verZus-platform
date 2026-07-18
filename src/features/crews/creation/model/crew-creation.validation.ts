// VERZUS M9.3 CREW CREATION VALIDATION

import type {
  CrewCreationDraft,
  CrewCreationErrors,
  CrewCreationStep,
} from "./crew-creation.types";

const reservedTags = new Set(["ADMIN", "MOD", "SYS", "VZ"]);

export function normalizeCrewTag(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 5);
}

export function createCrewSlug(name: string, submissionId: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix =
    submissionId
      .replace(/[^a-z0-9]/gi, "")
      .slice(-6)
      .toLowerCase() || "crew";
  return `crew-${base || "new"}-${suffix}`;
}

export function validateCrewCreationDraft(draft: CrewCreationDraft): CrewCreationErrors {
  const errors: CrewCreationErrors = {};
  const name = draft.name.trim();
  const description = draft.description.trim();

  if (name.length < 3 || name.length > 30) {
    errors.name = "Crew name must be between 3 and 30 characters.";
  }

  if (!/^[A-Z0-9]{2,5}$/.test(draft.tag)) {
    errors.tag = "Tag must contain 2 to 5 uppercase letters or numbers.";
  } else if (reservedTags.has(draft.tag)) {
    errors.tag = "This tag is reserved by VERZUS.";
  }

  if (description.length < 20 || description.length > 180) {
    errors.description = "Description must be between 20 and 180 characters.";
  }

  if (!draft.primaryGame) errors.primaryGame = "Choose a primary game.";
  if (!draft.region) errors.region = "Choose a Crew region.";
  if (!draft.crestPreset) errors.crestPreset = "Choose a crest preset.";
  if (!draft.bannerPreset) errors.bannerPreset = "Choose a banner preset.";

  return errors;
}

export function validateCrewCreationStep(
  draft: CrewCreationDraft,
  step: CrewCreationStep,
): CrewCreationErrors {
  const all = validateCrewCreationDraft(draft);

  if (step === "basics") {
    return {
      ...(all.name ? { name: all.name } : {}),
      ...(all.tag ? { tag: all.tag } : {}),
      ...(all.description ? { description: all.description } : {}),
      ...(all.primaryGame ? { primaryGame: all.primaryGame } : {}),
      ...(all.region ? { region: all.region } : {}),
    };
  }

  if (step === "identity") {
    return {
      ...(all.crestPreset ? { crestPreset: all.crestPreset } : {}),
      ...(all.bannerPreset ? { bannerPreset: all.bannerPreset } : {}),
    };
  }

  return {};
}

export function hasCrewCreationErrors(errors: CrewCreationErrors): boolean {
  return Object.keys(errors).length > 0;
}
