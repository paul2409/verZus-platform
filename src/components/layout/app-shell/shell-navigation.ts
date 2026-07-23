// VERZUS M12.5 ACTIVITY NAVIGATION
import type { ShellNavigationItem } from "./shell.types";

export const shellNavigationItems: readonly ShellNavigationItem[] = [
  {
    id: "play",
    href: "/play",
    label: "Play",
    icon: "gamepad",
    section: "main",
    offlineSafe: true,
  },
  {
    id: "compete",
    href: "/compete",
    label: "Compete",
    icon: "swords",
    section: "main",
    activePrefixes: ["/competitions"],
  },
  {
    id: "matches",
    href: "/matches",
    label: "Matches",
    icon: "calendar",
    section: "main",
  },
  {
    id: "leaderboards",
    href: "/leaderboards/weekly",
    label: "Leaderboards",
    shortLabel: "Ranks",
    icon: "trophy",
    section: "main",
    activePrefixes: ["/leaderboards"],
  },
  {
    id: "crews",
    href: "/crews",
    label: "Crews",
    icon: "users",
    section: "community",
    featureFlag: "crews",
  },
  {
    id: "rewards",
    href: "/rewards",
    label: "Rewards",
    icon: "gift",
    section: "community",
    featureFlag: "rewards",
  },
  {
    id: "activity",
    href: "/activity",
    label: "Activity",
    icon: "calendar",
    section: "community",
  },
  {
    id: "profile",
    href: "/profile",
    label: "Profile",
    icon: "user",
    section: "account",
    activePrefixes: ["/players"],
    offlineSafe: true,
  },
  {
    id: "notifications",
    href: "/notifications",
    label: "Notifications",
    icon: "bell",
    section: "account",
  },
  {
    id: "search",
    href: "/search",
    label: "Search",
    icon: "search",
    section: "account",
  },
  {
    id: "settings",
    href: "/settings",
    label: "Settings",
    icon: "settings",
    section: "account",
    featureFlag: "settings",
    offlineSafe: true,
  },
];

function navigationItem(id: string): ShellNavigationItem {
  const item = shellNavigationItems.find((candidate) => candidate.id === id);

  if (!item) {
    throw new Error(`Missing shell navigation item: ${id}`);
  }

  return item;
}

/** Dock order: Rewards | Leaderboards | Play | Crew | Profile */
export const mobileShellNavigationItems: readonly ShellNavigationItem[] = [
  {
    ...navigationItem("rewards"),
    label: "Rewards",
    shortLabel: "Rewards",
  },
  {
    id: "leaderboards",
    href: "/compete",
    label: "Leaderboards",
    shortLabel: "Ranks",
    icon: "trophy",
    section: "main",
    activePrefixes: ["/compete", "/leaderboards", "/matches"],
  },
  {
    ...navigationItem("play"),
    label: "Play",
    shortLabel: "Play",
  },
  {
    ...navigationItem("crews"),
    label: "Crew",
    shortLabel: "Crew",
  },
  {
    ...navigationItem("profile"),
    label: "Profile",
    shortLabel: "Profile",
  },
];
