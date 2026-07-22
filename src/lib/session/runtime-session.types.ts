export const platformRoles = [
  "player",
  "captain",
  "creator",
  "referee",
  "admin",
  "superadmin",
] as const;

export type PlatformRole = (typeof platformRoles)[number];

export type RuntimeSessionState =
  | "anonymous"
  | "authenticated"
  | "email_unverified"
  | "onboarding_incomplete"
  | "suspended"
  | "banned"
  | "session_expired";

export interface RuntimeSessionUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: PlatformRole;
  emailVerified: boolean;
  onboardingComplete: boolean;
}

export interface RuntimeSessionRecord {
  id: string;
  expiresAt: string;
  refreshable: boolean;
  deviceId: string | null;
}

export interface RuntimeSessionResponse {
  state: RuntimeSessionState;
  user: RuntimeSessionUser | null;
  session: RuntimeSessionRecord | null;
  restrictionReason: string | null;
  requestId: string;
}
