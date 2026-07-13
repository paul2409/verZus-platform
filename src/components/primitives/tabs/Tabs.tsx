"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import styles from "./Tabs.module.css";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivationMode = "automatic" | "manual";
export type TabsTone = "primary" | "secondary" | "accent";
export type TabsSize = "sm" | "md" | "lg";

export type TabsBaseProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> & {
  children: ReactNode;
  orientation?: TabsOrientation;
  activationMode?: TabsActivationMode;
  tone?: TabsTone;
  size?: TabsSize;
  loop?: boolean;
  onValueChange?: (value: string) => void;
};

export type TabsProps = TabsBaseProps &
  (
    | {
        value: string;
        defaultValue?: never;
      }
    | {
        value?: never;
        defaultValue: string;
      }
  );

export type TabListProps = HTMLAttributes<HTMLDivElement> & {
  scrollable?: boolean;
};

export type TabProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> & {
  value: string;
  children: ReactNode;
  leadingVisual?: ReactNode;
  trailingVisual?: ReactNode;
};

export type TabPanelProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
  children: ReactNode;
  forceMount?: boolean;
};

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
  loop: boolean;
  baseId: string;
  tabId: (value: string) => string;
  panelId: (value: string) => string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

const orientationClasses = {
  horizontal: styles.orientationHorizontal!,
  vertical: styles.orientationVertical!,
};

const toneClasses = {
  primary: styles.tonePrimary!,
  secondary: styles.toneSecondary!,
  accent: styles.toneAccent!,
};

const sizeClasses = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
};

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function sanitizeValue(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9_-]+/g, "-") || "item";
}

function useTabsContext(componentName: string): TabsContextValue {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error(`${componentName} must be rendered inside Tabs.`);
  }

  return context;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    children,
    value: controlledValue,
    defaultValue,
    orientation = "horizontal",
    activationMode = "automatic",
    tone = "primary",
    size = "md",
    loop = true,
    onValueChange,
    className,
    ...divProps
  },
  ref,
) {
  const generatedId = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;
  const baseId = `vz-tabs-${generatedId.replace(/:/g, "")}`;

  const setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  const tabId = useCallback(
    (itemValue: string) => `${baseId}-tab-${sanitizeValue(itemValue)}`,
    [baseId],
  );

  const panelId = useCallback(
    (itemValue: string) => `${baseId}-panel-${sanitizeValue(itemValue)}`,
    [baseId],
  );

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      value: currentValue,
      setValue,
      orientation,
      activationMode,
      loop,
      baseId,
      tabId,
      panelId,
    }),
    [activationMode, baseId, currentValue, loop, orientation, panelId, setValue, tabId],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        {...divProps}
        ref={ref}
        className={joinClassNames(
          styles.tabs,
          orientationClasses[orientation],
          toneClasses[tone],
          sizeClasses[size],
          className,
        )}
        data-tabs-activation={activationMode}
        data-tabs-orientation={orientation}
        data-tabs-size={size}
        data-tabs-tone={tone}
        data-tabs-value={currentValue}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

Tabs.displayName = "Tabs";

export const TabList = forwardRef<HTMLDivElement, TabListProps>(function TabList(
  { scrollable = true, className, ...divProps },
  ref,
) {
  const { orientation } = useTabsContext("TabList");

  return (
    <div
      {...divProps}
      ref={ref}
      aria-orientation={orientation}
      className={joinClassNames(styles.list, scrollable && styles.scrollable, className)}
      data-tabs-scrollable={scrollable ? "true" : "false"}
      role="tablist"
    />
  );
});

TabList.displayName = "TabList";

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  {
    value,
    children,
    leadingVisual,
    trailingVisual,
    disabled = false,
    className,
    onClick,
    onFocus,
    onKeyDown,
    type = "button",
    ...buttonProps
  },
  ref,
) {
  const context = useTabsContext("Tab");
  const selected = context.value === value;

  const moveFocus = (
    event: KeyboardEvent<HTMLButtonElement>,
    target: "next" | "previous" | "first" | "last",
  ) => {
    const list = event.currentTarget.closest('[role="tablist"]');
    const enabledTabs = list
      ? Array.from(list.querySelectorAll<HTMLButtonElement>('button[role="tab"]:not(:disabled)'))
      : [];

    if (enabledTabs.length === 0) {
      return;
    }

    const currentIndex = enabledTabs.indexOf(event.currentTarget);
    let targetIndex = currentIndex;

    if (target === "first") {
      targetIndex = 0;
    } else if (target === "last") {
      targetIndex = enabledTabs.length - 1;
    } else if (target === "next") {
      targetIndex = currentIndex + 1;

      if (targetIndex >= enabledTabs.length) {
        targetIndex = context.loop ? 0 : enabledTabs.length - 1;
      }
    } else {
      targetIndex = currentIndex - 1;

      if (targetIndex < 0) {
        targetIndex = context.loop ? enabledTabs.length - 1 : 0;
      }
    }

    enabledTabs[targetIndex]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const previousKey = context.orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const nextKey = context.orientation === "horizontal" ? "ArrowRight" : "ArrowDown";

    if (event.key === previousKey) {
      event.preventDefault();
      moveFocus(event, "previous");
      return;
    }

    if (event.key === nextKey) {
      event.preventDefault();
      moveFocus(event, "next");
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveFocus(event, "first");
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      moveFocus(event, "last");
      return;
    }

    if (context.activationMode === "manual" && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      context.setValue(value);
    }
  };

  return (
    <button
      {...buttonProps}
      ref={ref}
      aria-controls={context.panelId(value)}
      aria-selected={selected}
      className={joinClassNames(styles.tab, selected && styles.selected, className)}
      data-tab-value={value}
      disabled={disabled}
      id={context.tabId(value)}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          context.setValue(value);
        }
      }}
      onFocus={(event) => {
        onFocus?.(event);

        if (!event.defaultPrevented && context.activationMode === "automatic") {
          context.setValue(value);
        }
      }}
      onKeyDown={handleKeyDown}
      role="tab"
      tabIndex={selected ? 0 : -1}
      type={type}
    >
      {leadingVisual ? (
        <span aria-hidden="true" className={styles.visual}>
          {leadingVisual}
        </span>
      ) : null}

      <span className={styles.label}>{children}</span>

      {trailingVisual ? <span className={styles.trailing}>{trailingVisual}</span> : null}
    </button>
  );
});

Tab.displayName = "Tab";

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel(
  { value, children, forceMount = true, className, ...divProps },
  ref,
) {
  const context = useTabsContext("TabPanel");
  const selected = context.value === value;

  if (!forceMount && !selected) {
    return null;
  }

  return (
    <div
      {...divProps}
      ref={ref}
      aria-labelledby={context.tabId(value)}
      className={joinClassNames(styles.panel, className)}
      data-tab-panel-value={value}
      hidden={!selected}
      id={context.panelId(value)}
      role="tabpanel"
      tabIndex={0}
    >
      {children}
    </div>
  );
});

TabPanel.displayName = "TabPanel";
