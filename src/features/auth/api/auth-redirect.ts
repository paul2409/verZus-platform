// VERZUS M4 STEP 4.6

import type { AuthState } from "../model/auth-state";
import { getAuthStateDestination, readSafeNextPath } from "../routing/auth-destination";

export function resolveBrowserAuthDestination(state: AuthState, search: string): string {
  return getAuthStateDestination(state, readSafeNextPath(search));
}

export function redirectAfterAuthSuccess(state: AuthState): void {
  if (typeof window === "undefined") return;
  window.location.replace(resolveBrowserAuthDestination(state, window.location.search));
}
