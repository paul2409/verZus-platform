// VERZUS M11.7 SERVER-AUTHORITATIVE PROFILE ACCOUNT STATES

import "server-only";

import type {
  ProfileAccountStateScenario,
  PublicProfileAccountState,
} from "../model/profile-account-state.types";

export function normalizeProfileAccountStateScenario(
  value: string | null,
): ProfileAccountStateScenario {
  const allowed: ProfileAccountStateScenario[] = [
    "normal",
    "empty",
    "suspended",
    "blocked",
    "error",
    "offline",
    "slow",
    "malformed",
    "maintenance",
  ];
  return allowed.includes(value as ProfileAccountStateScenario)
    ? (value as ProfileAccountStateScenario)
    : "normal";
}

export function serializeProfileAccountState(scenario: ProfileAccountStateScenario) {
  switch (scenario) {
    case "empty":
      return {
        status: "empty" as const,
        profile_id: null,
        title: "Create your player identity",
        message: "Your account is active, but the player profile has not been completed.",
        case_reference: null,
        review_at_label: null,
        can_edit_profile: true,
        can_view_public_profile: false,
      };
    case "suspended":
      return {
        status: "suspended" as const,
        profile_id: "player-prismo",
        title: "Player profile suspended",
        message:
          "Competitive identity is temporarily unavailable while an account review is active.",
        case_reference: "CASE-PROFILE-2407",
        review_at_label: "Review expected within 48 hours",
        can_edit_profile: false,
        can_view_public_profile: false,
      };
    case "blocked":
      return {
        status: "blocked" as const,
        profile_id: "player-prismo",
        title: "Player profile blocked",
        message: "This profile is unavailable because a platform safety restriction is active.",
        case_reference: "CASE-SAFETY-1184",
        review_at_label: null,
        can_edit_profile: false,
        can_view_public_profile: false,
      };
    default:
      return {
        status: "active" as const,
        profile_id: "player-prismo",
        title: "Player profile active",
        message: "Profile identity and competitive records are available.",
        case_reference: null,
        review_at_label: null,
        can_edit_profile: true,
        can_view_public_profile: true,
      };
  }
}

export function getPublicProfileAccountState(playerId: string): PublicProfileAccountState {
  if (playerId === "player-suspended") {
    return {
      status: "suspended",
      playerId,
      displayName: "Review Pending",
      handle: "@review-pending",
      title: "Player profile suspended",
      message: "This competitive profile is temporarily unavailable during a platform review.",
      caseReference: "CASE-PUBLIC-2407",
    };
  }
  if (playerId === "player-blocked") {
    return {
      status: "blocked",
      playerId,
      displayName: "Unavailable Player",
      handle: "@unavailable",
      title: "Player profile unavailable",
      message: "This profile cannot be displayed because a safety restriction is active.",
      caseReference: null,
    };
  }
  return {
    status: "active",
    playerId,
    displayName: "",
    handle: "",
    title: "",
    message: "",
    caseReference: null,
  };
}
