// VERZUS M12.5 ACTIVITY PLATFORM ROUTE
import { normalizeShellPath } from "./navigation-state";

export type PlatformRouteId =
  | "play"
  | "compete"
  | "matches"
  | "leaderboards-weekly"
  | "crews"
  | "rewards"
  | "profile"
  | "notifications"
  | "activity"
  | "search"
  | "settings";

export type PlatformBreadcrumb = {
  label: string;
  href?: string | undefined;
};

export type PlatformRouteDescriptor = {
  id: PlatformRouteId;
  href: string;
  title: string;
  eyebrow: string;
  description: string;
  section: string;
  breadcrumbs: readonly PlatformBreadcrumb[];
};

export const platformRoutes: readonly PlatformRouteDescriptor[] = [
  {
    id: "play",
    href: "/play",
    title: "Play",
    eyebrow: "Command centre",
    description: "Your next action, current position and competitive opportunities.",
    section: "Primary",
    breadcrumbs: [{ label: "Play" }],
  },
  {
    id: "compete",
    href: "/compete",
    title: "Compete",
    eyebrow: "Competition discovery",
    description: "Find eligible competitions, inspect details and enter safely.",
    section: "Competition",
    breadcrumbs: [{ label: "Compete" }],
  },
  {
    id: "matches",
    href: "/matches",
    title: "Matches",
    eyebrow: "Match operations",
    description: "Review scheduled, active and completed matches.",
    section: "Competition",
    breadcrumbs: [{ label: "Matches" }],
  },
  {
    id: "leaderboards-weekly",
    href: "/leaderboards/weekly",
    title: "Weekly Leaderboard",
    eyebrow: "Rankings",
    description: "Track weekly player standings and your current position.",
    section: "Rankings",
    breadcrumbs: [{ label: "Leaderboards", href: "/leaderboards/weekly" }, { label: "Weekly" }],
  },
  {
    id: "crews",
    href: "/crews",
    title: "Crews",
    eyebrow: "Team identity",
    description: "Discover, manage and compete with your Crew.",
    section: "Social",
    breadcrumbs: [{ label: "Crews" }],
  },
  {
    id: "rewards",
    href: "/rewards",
    title: "Rewards",
    eyebrow: "Progression",
    description: "Review progression, achievements and available rewards.",
    section: "Progression",
    breadcrumbs: [{ label: "Rewards" }],
  },
  {
    id: "profile",
    href: "/profile",
    title: "Player Profile",
    eyebrow: "Identity",
    description: "Manage your public identity, game handles and performance history.",
    section: "Account",
    breadcrumbs: [{ label: "Profile" }],
  },
  {
    id: "notifications",
    href: "/notifications",
    title: "Notifications",
    eyebrow: "Activity centre",
    description: "Review match, Crew, ranking and platform updates.",
    section: "Account",
    breadcrumbs: [{ label: "Notifications" }],
  },
  {
    id: "activity",
    href: "/activity",
    title: "Activity Feed",
    eyebrow: "Personalized signals",
    description: "Follow verified movement across your competitive network.",
    section: "Account",
    breadcrumbs: [{ label: "Activity" }],
  },
  {
    id: "search",
    href: "/search",
    title: "Search",
    eyebrow: "Global discovery",
    description: "Find players, Crews, competitions and matches.",
    section: "Utility",
    breadcrumbs: [{ label: "Search" }],
  },
  {
    id: "settings",
    href: "/settings",
    title: "Settings",
    eyebrow: "Preferences",
    description: "Control account, privacy, accessibility and notification preferences.",
    section: "Account",
    breadcrumbs: [{ label: "Settings" }],
  },
];

const routeById = new Map<PlatformRouteId, PlatformRouteDescriptor>(
  platformRoutes.map((route) => [route.id, route]),
);

export function getPlatformRouteById(id: PlatformRouteId): PlatformRouteDescriptor {
  const route = routeById.get(id);

  if (!route) {
    throw new Error(`Unknown platform route: ${id}`);
  }

  return route;
}

export function resolvePlatformRoute(pathname: string): PlatformRouteDescriptor | null {
  const normalizedPath = normalizeShellPath(pathname);

  const exact = platformRoutes.find((route) => normalizeShellPath(route.href) === normalizedPath);

  if (exact) {
    return exact;
  }

  const candidates = platformRoutes
    .filter((route) => {
      const href = normalizeShellPath(route.href);
      return normalizedPath.startsWith(`${href}/`);
    })
    .sort((left, right) => right.href.length - left.href.length);

  return candidates[0] ?? null;
}
