// VERZUS M11.4 RESOURCE-AWARE OWN PROFILE COMPOSITION

"use client";

import { useSearchParams } from "next/navigation";

import { ownPlayerProfileMock, PlayerProfileFoundationScreen } from "../../foundation";
import { useProfileResources } from "../hooks/useProfileResources";
import { mergeProfileResourceSnapshots } from "../model/profile-resource.merge";
import type { ProfileResourceName, ProfileResourceScenario } from "../model/profile-resource.types";
import { ProfileResourceStatusStrip } from "./ProfileResourceStatusStrip";

const resourceNames: ProfileResourceName[] = [
  "identity",
  "competitive-summary",
  "crew",
  "availability",
];

const scenarios: ProfileResourceScenario[] = [
  "normal",
  "stale",
  "empty",
  "error",
  "offline",
  "slow",
  "malformed",
  "unauthorized",
  "forbidden",
  "not-found",
  "maintenance",
];

function asResource(value: string | null): ProfileResourceName | undefined {
  return resourceNames.includes(value as ProfileResourceName)
    ? (value as ProfileResourceName)
    : undefined;
}

function asScenario(value: string | null): ProfileResourceScenario {
  return scenarios.includes(value as ProfileResourceScenario)
    ? (value as ProfileResourceScenario)
    : "normal";
}

export function PlayerProfileResourceScreen() {
  const searchParams = useSearchParams();
  const target = asResource(searchParams.get("resource"));
  const scenario = asScenario(searchParams.get("scenario"));
  const resources = useProfileResources(target, scenario);
  const model = mergeProfileResourceSnapshots(ownPlayerProfileMock, resources.snapshots);

  return (
    <div data-m11-stage="11.4" data-profile-resource-composition="independent">
      <ProfileResourceStatusStrip
        health={resources.health}
        onRetry={(name) => void resources.retry(name)}
      />
      <PlayerProfileFoundationScreen model={model} />
    </div>
  );
}
