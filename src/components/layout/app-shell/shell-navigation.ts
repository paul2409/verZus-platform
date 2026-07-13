import type { ShellNavigationItem } from "./shell.types";

export const shellNavigationItems: readonly ShellNavigationItem[] = [
  {
    id: "play",
    href: "/play",
    label: "Play",
    icon: "gamepad",
    offlineSafe: true,
  },
  {
    id: "compete",
    href: "/compete",
    label: "Compete",
    icon: "swords",
    activePrefixes: ["/competitions"],
  },
  {
    id: "matches",
    href: "/matches",
    label: "Matches",
    icon: "calendar",
  },
  {
    id: "leaderboards",
    href: "/leaderboards/weekly",
    label: "Leaderboards",
    shortLabel: "Ranks",
    icon: "trophy",
    activePrefixes: ["/leaderboards"],
  },
  {
    id: "crews",
    href: "/crews",
    label: "Crews",
    icon: "users",
    featureFlag: "crews",
  },
  {
    id: "rewards",
    href: "/rewards",
    label: "Rewards",
    icon: "gift",
    featureFlag: "rewards",
  },
  {
    id: "profile",
    href: "/profile",
    label: "Profile",
    icon: "user",
    activePrefixes: ["/players"],
    offlineSafe: true,
  },
  {
    id: "notifications",
    href: "/notifications",
    label: "Notifications",
    icon: "bell",
  },
  {
    id: "search",
    href: "/search",
    label: "Search",
    icon: "search",
  },
  {
    id: "settings",
    href: "/settings",
    label: "Settings",
    icon: "settings",
    featureFlag: "settings",
    offlineSafe: true,
  },
];

export const mobileShellNavigationItems: readonly ShellNavigationItem[] = [
  shellNavigationItems[0]!,
  shellNavigationItems[1]!,
  shellNavigationItems[4]!,
  shellNavigationItems[5]!,
  shellNavigationItems[6]!,
];
