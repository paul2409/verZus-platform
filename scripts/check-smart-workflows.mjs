import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const failures = [];
const requireText = (path, text, message) => {
  if (!read(path).includes(text)) failures.push(message);
};
const forbidText = (path, text, message) => {
  if (read(path).includes(text)) failures.push(message);
};

forbidText(
  "src/features/play/ui/PlayCommandCenter.tsx",
  "PlayActionStrip",
  "Play still renders the duplicate action strip.",
);
forbidText(
  "src/features/play/ui/PlayCommandCenter.tsx",
  "GameModeGrid",
  "Play still renders the hardcoded game-mode directory.",
);
requireText(
  "src/features/matches/operations/ui/MatchOperationsResourceScreen.tsx",
  "getMatchWorkflowSections",
  "Match operations are not state-scoped.",
);
requireText(
  "src/features/crews/membership/ui/CrewMembershipPanels.tsx",
  "Membership inbox",
  "Crew applications and invitations are not presented as one inbox.",
);
forbidText(
  "src/features/crews/membership/ui/CrewMembershipPanels.tsx",
  'useState("@orbit")',
  "Crew invite form still contains a fictional player handle.",
);
forbidText(
  "src/features/onboarding/ui/OnboardingExperience.tsx",
  "250 XP",
  "Onboarding still promises fictional XP.",
);
forbidText(
  "src/features/onboarding/ui/OnboardingExperience.tsx",
  "LV. 01",
  "Onboarding still displays a fictional level.",
);
requireText(
  "src/features/settings/ui/SettingsScreen.tsx",
  'href="/notifications/settings"',
  "Settings does not delegate notification ownership.",
);
forbidText(
  "src/features/settings/ui/SettingsScreen.tsx",
  "defaultChecked",
  "Settings still contains duplicate local preference switches.",
);
forbidText(
  "src/features/search/foundation/ui/SearchFoundationScreen.tsx",
  "M12.2 independent search resources",
  "Search still exposes milestone implementation copy.",
);
forbidText(
  "src/features/notifications/mutations/ui/NotificationOperationsScreen.tsx",
  "M12.4 notification mutations",
  "Notifications still exposes milestone implementation copy.",
);

requireText(
  "src/features/play/ui/PlayCommandCenter.tsx",
  "buildPlaySmartActions",
  "Play does not use the deterministic next-best-action policy.",
);
forbidText(
  "src/features/play/ui/QuickActions.tsx",
  "const actions = [",
  "Play quick actions are still static instead of state-derived.",
);

requireText(
  "src/features/play/ui/PlayCommandCenter.tsx",
  "ActionCentrePanel",
  "Play does not render the unified action centre.",
);
forbidText(
  "src/features/play/ui/PlayCommandCenter.tsx",
  "DailyChallengesPanel",
  "Play still renders the placeholder daily-challenges panel instead of live priorities.",
);
requireText(
  "src/shared/composition/action-centre/server/action-centre.repository.ts",
  "reward_grants",
  "Action centre does not include claimable rewards.",
);
requireText(
  "src/shared/composition/action-centre/server/action-centre.repository.ts",
  "crew_invites",
  "Action centre does not include Crew invitations.",
);
requireText(
  "src/shared/composition/action-centre/server/action-centre.repository.ts",
  "match_participants",
  "Action centre does not include pending match actions.",
);

requireText(
  "database/migrations/0012_workflow_resume_checkpoints.sql",
  "workflow_resume_checkpoints",
  "Smart Resume persistence migration is missing.",
);
requireText(
  "src/shared/composition/workflow-resume/server/workflow-resume.policy.ts",
  "resolveWorkflowResumePolicy",
  "Smart Resume does not validate workflow-specific checkpoints.",
);
requireText(
  "src/features/crews/creation/ui/CrewCreationScreen.tsx",
  '"crew_creation"',
  "Crew creation does not save a resumable checkpoint.",
);
requireText(
  "src/features/competitions/entry/ui/CompetitionEntryControl.tsx",
  '"competition_entry"',
  "Competition entry does not expose resumable confirmation.",
);
requireText(
  "src/features/matches/operations/ui/ResultOperationsPanel.tsx",
  '"match_result"',
  "Match result drafts are not resumable.",
);
requireText(
  "src/shared/composition/action-centre/server/action-centre.repository.ts",
  "workflow_resume_checkpoints",
  "Action Centre does not include resumable workflows.",
);

requireText(
  "src/features/crews/creation/ui/CrewCreationScreen.tsx",
  "readSmartDefaults",
  "Crew creation does not consume safe server-derived defaults.",
);
requireText(
  "src/features/competitions/discovery/hooks/useCompetitionDiscoveryUrlState.ts",
  "rememberSmartDefaults",
  "Competition discovery does not remember explicit player choices.",
);
requireText(
  "src/features/leaderboards/explorer/hooks/useLeaderboardUrlState.ts",
  "readSmartDefaults",
  "Leaderboards do not apply the player's saved mode and game.",
);
requireText(
  "src/shared/composition/smart-defaults/server/smart-defaults.repository.ts",
  "player_game_identities",
  "Smart defaults are not derived from the production game identity.",
);
requireText(
  "src/shared/composition/smart-defaults/server/smart-defaults.repository.ts",
  "user_smart_preferences",
  "Smart defaults do not persist low-risk explicit choices.",
);
forbidText(
  "src/shared/composition/smart-defaults/server/smart-defaults.service.ts",
  "Math.random",
  "Smart defaults must remain deterministic.",
);

requireText(
  "database/migrations/0014_proactive_operations.sql",
  "proactive_operation_runs",
  "Proactive Operations run history migration is missing.",
);
requireText(
  "src/shared/composition/proactive-operations/server/proactive-operations.repository.ts",
  "pg_try_advisory_xact_lock",
  "Proactive Operations does not prevent overlapping runners.",
);
requireText(
  "src/shared/composition/proactive-operations/server/proactive-operations.repository.ts",
  "ON CONFLICT (user_id, reference)",
  "Proactive reminders are not idempotent.",
);
requireText(
  "src/app/api/internal/proactive-operations/route.ts",
  "handleProactiveOperationsPost",
  "The protected proactive scheduler route is missing.",
);
requireText(
  "src/lib/config/env.schema.ts",
  "PROACTIVE_OPERATIONS_TOKEN",
  "The proactive scheduler token is not validated as a server secret.",
);
forbidText(
  "src/shared/composition/proactive-operations/server/proactive-operations.policy.ts",
  "Math.random",
  "Proactive reminder decisions must remain deterministic.",
);

if (failures.length) {
  console.error("Smart-workflow contract failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Smart-workflow contract passed.");
