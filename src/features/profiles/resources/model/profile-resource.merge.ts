// VERZUS M11.4 PROFILE VIEW-MODEL MERGE

import type { PlayerProfileViewModel } from "../../foundation";
import type { ProfileResourceSnapshotMap } from "./profile-resource.types";

export function mergeProfileResourceSnapshots(
  base: PlayerProfileViewModel,
  snapshots: ProfileResourceSnapshotMap,
): PlayerProfileViewModel {
  return {
    ...base,
    identity: snapshots.identity?.data ?? base.identity,
    stats: snapshots["competitive-summary"]?.data ?? base.stats,
    crew: snapshots.crew ? snapshots.crew.data : base.crew,
    availability: snapshots.availability?.data ?? base.availability,
  };
}
