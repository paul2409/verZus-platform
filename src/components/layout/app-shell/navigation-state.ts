import type {
  ResolvedShellNavigationItem,
  ShellFeatureFlags,
  ShellNavigationItem,
  ShellNavigationRuntimeStates,
  ShellNavigationState,
} from "./shell.types";

export type ResolveShellNavigationOptions = {
  currentPath: string;
  featureFlags?: ShellFeatureFlags | undefined;
  runtimeStates?: ShellNavigationRuntimeStates | undefined;
  offline?: boolean | undefined;
};

const nonInteractiveStates = new Set<ShellNavigationState>([
  "disabled",
  "feature-flagged",
  "loading",
]);

const stateReasons: Record<Exclude<ShellNavigationState, "available">, string> = {
  partial: "Partially available.",
  disabled: "Unavailable.",
  loading: "Preparing this destination.",
  error: "Destination is experiencing a problem.",
  "feature-flagged": "This feature is not enabled.",
};

export function normalizeShellPath(path: string): string {
  const withoutFragment = path.split("#", 1)[0] ?? "/";
  const withoutQuery = withoutFragment.split("?", 1)[0] ?? "/";
  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;

  if (withLeadingSlash === "/") {
    return "/";
  }

  return withLeadingSlash.replace(/\/+$/, "") || "/";
}

function matchesPrefix(currentPath: string, prefix: string): boolean {
  const normalizedCurrent = normalizeShellPath(currentPath);
  const normalizedPrefix = normalizeShellPath(prefix);

  return (
    normalizedCurrent === normalizedPrefix || normalizedCurrent.startsWith(`${normalizedPrefix}/`)
  );
}

export function isShellNavigationCurrent(currentPath: string, item: ShellNavigationItem): boolean {
  const normalizedCurrent = normalizeShellPath(currentPath);
  const normalizedHref = normalizeShellPath(item.href);

  if (item.match === "exact") {
    return normalizedCurrent === normalizedHref;
  }

  if (matchesPrefix(normalizedCurrent, normalizedHref)) {
    return true;
  }

  return (item.activePrefixes ?? []).some((prefix) => matchesPrefix(normalizedCurrent, prefix));
}

function resolveState(
  item: ShellNavigationItem,
  options: ResolveShellNavigationOptions,
): ShellNavigationState {
  if (item.featureFlag && options.featureFlags?.[item.featureFlag] === false) {
    return "feature-flagged";
  }

  if (options.offline === true && item.offlineSafe !== true) {
    return "disabled";
  }

  return options.runtimeStates?.[item.id] ?? item.state ?? "available";
}

export function getShellNavigationStateReason(
  state: ShellNavigationState,
  item: ShellNavigationItem,
  offline: boolean,
): string | null {
  if (offline && item.offlineSafe !== true && state === "disabled") {
    return "Unavailable while offline.";
  }

  if (state === "available") {
    return null;
  }

  return stateReasons[state];
}

export function resolveShellNavigationItem(
  item: ShellNavigationItem,
  options: ResolveShellNavigationOptions,
): ResolvedShellNavigationItem {
  const state = resolveState(item, options);
  const offline = options.offline === true;

  return {
    item,
    state,
    current: isShellNavigationCurrent(options.currentPath, item),
    disabled: nonInteractiveStates.has(state),
    reason: getShellNavigationStateReason(state, item, offline),
  };
}

export function resolveShellNavigationItems(
  items: readonly ShellNavigationItem[],
  options: ResolveShellNavigationOptions,
): readonly ResolvedShellNavigationItem[] {
  return items.map((item) => resolveShellNavigationItem(item, options));
}
