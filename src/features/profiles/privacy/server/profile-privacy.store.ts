// VERZUS M11.7 SERVER-ONLY PROFILE PRIVACY STORE

import "server-only";

import type {
  ProfilePrivacySettings,
  ProfilePrivacySnapshot,
} from "../model/profile-privacy.types";

const defaultSettings: ProfilePrivacySettings = {
  profileVisibility: "public",
  location: "public",
  crew: "public",
  statistics: "public",
  trustScore: "public",
  matchHistory: "public",
  gameHandles: "friends",
  achievements: "public",
  availability: "friends",
};

type StoredCommand = {
  fingerprint: string;
  snapshot: Omit<ProfilePrivacySnapshot, "requestId" | "source" | "replayed">;
};

type ProfilePrivacyStore = {
  playerId: string;
  version: number;
  updatedAt: string;
  settings: ProfilePrivacySettings;
  commands: Map<string, StoredCommand>;
  responseLosses: Set<string>;
};

type ProfilePrivacyGlobal = typeof globalThis & {
  __verzusM117ProfilePrivacyStore?: ProfilePrivacyStore;
};

const globalScope = globalThis as ProfilePrivacyGlobal;

function createStore(): ProfilePrivacyStore {
  return {
    playerId: "player-prismo",
    version: 1,
    updatedAt: "2026-07-20T12:00:00.000Z",
    settings: structuredClone(defaultSettings),
    commands: new Map(),
    responseLosses: new Set(),
  };
}

const store = globalScope.__verzusM117ProfilePrivacyStore ?? createStore();
globalScope.__verzusM117ProfilePrivacyStore = store;

function coreSnapshot(): Omit<ProfilePrivacySnapshot, "requestId" | "source" | "replayed"> {
  return {
    playerId: store.playerId,
    version: store.version,
    updatedAt: store.updatedAt,
    settings: structuredClone(store.settings),
  };
}

export function readProfilePrivacySnapshot(input: {
  requestId: string;
  source?: string;
  replayed?: boolean;
}): ProfilePrivacySnapshot {
  return {
    ...coreSnapshot(),
    requestId: input.requestId,
    source: input.source ?? "mock-profile-privacy",
    replayed: input.replayed ?? false,
  };
}

export function readProfilePrivacyForPublicProjection(): ProfilePrivacySettings {
  return structuredClone(store.settings);
}

export function findStoredProfilePrivacyCommand(
  idempotencyKey: string,
  fingerprint: string,
  requestId: string,
): ProfilePrivacySnapshot | null {
  const stored = store.commands.get(idempotencyKey);
  if (!stored) return null;
  if (stored.fingerprint !== fingerprint) throw new Error("IDEMPOTENCY_KEY_REUSED");
  return {
    ...structuredClone(stored.snapshot),
    requestId,
    source: "mock-profile-privacy",
    replayed: true,
  };
}

export function persistProfilePrivacyUpdate(input: {
  settings: ProfilePrivacySettings;
  idempotencyKey: string;
  fingerprint: string;
  requestId: string;
  now?: Date;
}): ProfilePrivacySnapshot {
  store.version += 1;
  store.updatedAt = (input.now ?? new Date()).toISOString();
  store.settings = structuredClone(input.settings);

  const snapshot = coreSnapshot();
  store.commands.set(input.idempotencyKey, {
    fingerprint: input.fingerprint,
    snapshot: structuredClone(snapshot),
  });

  return {
    ...snapshot,
    requestId: input.requestId,
    source: "mock-profile-privacy",
    replayed: false,
  };
}

export function shouldLoseProfilePrivacyResponse(idempotencyKey: string): boolean {
  if (store.responseLosses.has(idempotencyKey)) return false;
  store.responseLosses.add(idempotencyKey);
  return true;
}
