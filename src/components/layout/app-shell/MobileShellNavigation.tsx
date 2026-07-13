import {
  BottomNavigation,
  BottomNavigationItem,
  NavigationBadge,
} from "@/components/primitives/bottom-navigation";
import { Icon } from "@/components/primitives/icon";

import { resolveShellNavigationItems } from "./navigation-state";
import type {
  ShellFeatureFlags,
  ShellNavigationItem,
  ShellNavigationRuntimeStates,
} from "./shell.types";

export type MobileShellNavigationProps = {
  currentPath: string;
  items: readonly ShellNavigationItem[];
  featureFlags?: ShellFeatureFlags | undefined;
  runtimeStates?: ShellNavigationRuntimeStates | undefined;
  offline?: boolean | undefined;
};

export function MobileShellNavigation({
  currentPath,
  items,
  featureFlags,
  runtimeStates,
  offline = false,
}: MobileShellNavigationProps) {
  const resolvedItems = resolveShellNavigationItems(items, {
    currentPath,
    featureFlags,
    runtimeStates,
    offline,
  });

  return (
    <BottomNavigation items={5} label="Primary mobile navigation" position="fixed" safeArea>
      {resolvedItems.map(({ item, state, current, disabled }) => {
        const count = item.notification?.count ?? item.badgeCount;
        const badge =
          item.notification?.dot === true ? (
            <NavigationBadge
              dot
              label={item.notification.label}
              tone={item.notification.tone ?? "danger"}
            />
          ) : count !== undefined && count > 0 ? (
            <NavigationBadge
              count={count}
              label={item.notification?.label ?? `${count} unread`}
              tone={item.notification?.tone ?? "danger"}
            />
          ) : undefined;

        const bottomState = disabled
          ? "disabled"
          : state === "partial" || state === "error"
            ? "partial"
            : "available";

        return (
          <BottomNavigationItem
            badge={badge}
            current={current}
            href={item.href}
            icon={<Icon decorative name={item.icon} size="md" />}
            key={item.id}
            label={item.shortLabel ?? item.label}
            offlineSafe={item.offlineSafe ?? false}
            prominent={item.id === "play"}
            state={bottomState}
          />
        );
      })}
    </BottomNavigation>
  );
}
