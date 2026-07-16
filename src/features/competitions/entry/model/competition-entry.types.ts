import type {
  CompetitionDetailResourceState,
  CompetitionDetailScenario,
} from "../../details/model/competition-detail.types";

export type CompetitionEntryScenario = CompetitionDetailScenario;

export type CompetitionEntryLifecycleState =
  | "scheduled"
  | "registration_open"
  | "registration_closed"
  | "check_in_open"
  | "in_progress"
  | "completed"
  | "cancelled";

export type CompetitionEntryEligibilityState = "eligible" | "not_eligible" | "pending";

export type CompetitionEntryRecordViewModel = {
  entryId: string;
  competitionId: string;
  competitionName: string;
  state: "confirmed";
  stateLabel: string;
  entrantLabel: string;
  teamLabel: string;
  registeredAt: string;
  registeredAtLabel: string;
  registrationCode: string;
  entryFeeLabel: string;
  checkInLabel: string;
};

export type CompetitionEntryControlViewModel = {
  competitionId: string;
  competitionName: string;
  lifecycleState: CompetitionEntryLifecycleState;
  lifecycleLabel: string;
  stateVersion: string;
  canEnter: boolean;
  eligibilityState: CompetitionEntryEligibilityState;
  eligibilityLabel: string;
  eligibilitySummary: string;
  entrantLabel: string;
  teamLabel: string;
  gameLabel: string;
  formatLabel: string;
  entryFeeLabel: string;
  rosterLockLabel: string;
  checkInLabel: string;
  existingEntry: CompetitionEntryRecordViewModel | null;
};

export type CompetitionEntryCommand = {
  competitionId: string;
  expectedStateVersion: string;
  idempotencyKey: string;
  acceptedTerms: true;
};

export type CompetitionEntryMutationResult = {
  entry: CompetitionEntryRecordViewModel;
  duplicate: boolean;
  alreadyEntered: boolean;
  requestId: string;
};

export type CompetitionEntryControlResourceData = {
  value: CompetitionEntryControlViewModel;
  meta: {
    requestId: string;
    serverNow: string;
    lastUpdatedAt: string;
    freshness: "fresh" | "stale";
  };
};

export type CompetitionEntryResource = {
  state: CompetitionDetailResourceState;
  data: CompetitionEntryControlResourceData | null;
  errorCode: string | null;
  requestId: string | null;
  canRetry: boolean;
};
