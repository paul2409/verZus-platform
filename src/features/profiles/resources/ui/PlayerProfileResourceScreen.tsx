"use client";

import { PlayerProfileFoundationScreen } from "../../foundation";
import { useProfileResources } from "../hooks/useProfileResources";
import type { ProfileResourceDataMap } from "../model/profile-resource.types";
import { ProfileResourceStatusStrip } from "./ProfileResourceStatusStrip";

const emptyStats: ProfileResourceDataMap["competitive-summary"] = {
  matches: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winRateLabel: "Not ranked",
  rating: 0,
  weeklyRank: 0,
  points: 0,
  trustScore: 0,
  currentStreakLabel: "No active",
};

const emptyAvailability: ProfileResourceDataMap["availability"] = {
  state: "unavailable",
  label: "No availability set",
  detail: "Add availability from your profile settings.",
  nextWindowLabel: "No upcoming window",
};

export function PlayerProfileResourceScreen() {
  const resources = useProfileResources(undefined, "normal");
  const identity = resources.snapshots.identity?.data;

  if (!identity) {
    const identityHealth = resources.health.identity;
    return (
      <main className="vz-route-boundary" data-profile-resource-composition="independent">
        <ProfileResourceStatusStrip
          health={resources.health}
          onRetry={(name) => void resources.retry(name)}
        />
        <div
          className={`vz-route-boundary vz-route-boundary--${identityHealth.state === "loading" ? "loading" : "error"}`}
        >
          <h1>
            {identityHealth.state === "loading" ? "Loading player profile" : "Profile unavailable"}
          </h1>
          <p>{identityHealth.message ?? "Your profile identity is being loaded."}</p>
        </div>
      </main>
    );
  }

  const model = {
    identity,
    stats: resources.snapshots["competitive-summary"]?.data ?? emptyStats,
    crew: resources.snapshots.crew?.data ?? null,
    availability: resources.snapshots.availability?.data ?? emptyAvailability,
    games: [],
    recentMatches: [],
    achievements: [],
  };

  return (
    <div data-profile-resource-composition="independent">
      <ProfileResourceStatusStrip
        health={resources.health}
        onRetry={(name) => void resources.retry(name)}
      />
      <PlayerProfileFoundationScreen model={model} />
    </div>
  );
}
