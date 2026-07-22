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

if (failures.length) {
  console.error("Smart-workflow contract failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Smart-workflow contract passed.");
