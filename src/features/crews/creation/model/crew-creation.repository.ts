// VERZUS M9.3 LOCAL CREW CREATION REPOSITORY

import {
  createInitialCrewCreationDraft,
  crewCreationAssetPaths,
  type CrewCreationDraft,
  type CrewCreationPersistedState,
  type CrewCreationRecord,
} from "./crew-creation.types";
import { createCrewSlug } from "./crew-creation.validation";

export const crewCreationStorageKey = "verzus:m9:crew-creation:v1";

export type CrewCreationStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function createCrewCreationSubmissionId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `submission-${Date.now().toString(36)}`;
}

export function createEmptyCrewCreationState(
  submissionId = createCrewCreationSubmissionId(),
): CrewCreationPersistedState {
  return {
    version: 1,
    draft: createInitialCrewCreationDraft(submissionId),
    created: null,
  };
}

export function loadCrewCreationState(storage: CrewCreationStorage): CrewCreationPersistedState {
  const raw = storage.getItem(crewCreationStorageKey);
  if (!raw) return createEmptyCrewCreationState();

  try {
    const parsed = JSON.parse(raw) as Partial<CrewCreationPersistedState>;
    if (parsed.version !== 1 || !parsed.draft || parsed.draft.version !== 1) {
      return createEmptyCrewCreationState();
    }

    return {
      version: 1,
      draft: parsed.draft as CrewCreationDraft,
      created: (parsed.created as CrewCreationRecord | null | undefined) ?? null,
    };
  } catch {
    return createEmptyCrewCreationState();
  }
}

export function saveCrewCreationState(
  storage: CrewCreationStorage,
  state: CrewCreationPersistedState,
): void {
  storage.setItem(crewCreationStorageKey, JSON.stringify(state));
}

export function clearCrewCreationState(storage: CrewCreationStorage): void {
  storage.removeItem(crewCreationStorageKey);
}

export function createCrewRecord(
  draft: CrewCreationDraft,
  createdAt: Date,
  existing: CrewCreationRecord | null,
): CrewCreationRecord {
  if (existing?.submissionId === draft.submissionId) return existing;

  return {
    id: createCrewSlug(draft.name, draft.submissionId),
    createdAt: createdAt.toISOString(),
    lifecycle: "forming",
    memberCount: 1,
    owner: {
      id: "player-current",
      name: "You",
      role: "owner",
    },
    identity: {
      name: draft.name.trim(),
      tag: draft.tag,
      description: draft.description.trim(),
      primaryGame: draft.primaryGame,
      region: draft.region,
      crestSrc: crewCreationAssetPaths.crest[draft.crestPreset],
      bannerSrc: crewCreationAssetPaths.banner[draft.bannerPreset],
      visibility: draft.visibility,
    },
    settings: {
      recruiting: draft.recruiting,
      language: draft.language,
      minimumRank: draft.minimumRank,
    },
    submissionId: draft.submissionId,
  };
}
