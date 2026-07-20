// VERZUS M11.7 PROFILE ACCOUNT-STATE AND RESOURCE COMPOSITION
// VERZUS M11.8 RELEASE-READY PROFILE COMPOSITION

import { ProfileAccountStateGate } from "../account-state";
import { PlayerProfileResourceScreen } from "../resources";

export function ProfileScreen() {
  return (
    <ProfileAccountStateGate>
      <PlayerProfileResourceScreen />
    </ProfileAccountStateGate>
  );
}
