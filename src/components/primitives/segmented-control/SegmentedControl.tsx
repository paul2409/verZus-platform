"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import styles from "./SegmentedControl.module.css";

export type SegmentedControlOrientation = "horizontal" | "vertical";
export type SegmentedControlSize = "sm" | "md" | "lg";
export type SegmentedControlTone = "primary" | "secondary" | "accent";

export type SegmentedControlBaseProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> & {
  children: ReactNode;
  orientation?: SegmentedControlOrientation;
  size?: SegmentedControlSize;
  tone?: SegmentedControlTone;
  fullWidth?: boolean;
  loop?: boolean;
  onValueChange?: (value: string) => void;
};

export type SegmentedControlProps = SegmentedControlBaseProps &
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

export type SegmentedControlItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> & {
  value: string;
  children: ReactNode;
  leadingVisual?: ReactNode;
};

type SegmentedContextValue = {
  value: string;
  setValue: (value: string) => void;
  orientation: SegmentedControlOrientation;
  loop: boolean;
};

const SegmentedContext = createContext<SegmentedContextValue | null>(null);

const orientationClasses = {
  horizontal: styles.orientationHorizontal!,
  vertical: styles.orientationVertical!,
};

const sizeClasses = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
};

const toneClasses = {
  primary: styles.tonePrimary!,
  secondary: styles.toneSecondary!,
  accent: styles.toneAccent!,
};

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function useSegmentedContext(componentName: string): SegmentedContextValue {
  const context = useContext(SegmentedContext);

  if (!context) {
    throw new Error(`${componentName} must be rendered inside SegmentedControl.`);
  }

  return context;
}

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl(
    {
      children,
      value: controlledValue,
      defaultValue,
      orientation = "horizontal",
      size = "md",
      tone = "primary",
      fullWidth = false,
      loop = true,
      onValueChange,
      className,
      ...divProps
    },
    ref,
  ) {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : uncontrolledValue;

    const setValue = useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(nextValue);
        }

        onValueChange?.(nextValue);
      },
      [isControlled, onValueChange],
    );

    const contextValue = useMemo<SegmentedContextValue>(
      () => ({ value: currentValue, setValue, orientation, loop }),
      [currentValue, loop, orientation, setValue],
    );

    return (
      <SegmentedContext.Provider value={contextValue}>
        <div
          {...divProps}
          ref={ref}
          aria-orientation={orientation}
          className={joinClassNames(
            styles.root,
            orientationClasses[orientation],
            sizeClasses[size],
            toneClasses[tone],
            fullWidth && styles.fullWidth,
            className,
          )}
          data-segmented-full-width={fullWidth ? "true" : "false"}
          data-segmented-orientation={orientation}
          data-segmented-size={size}
          data-segmented-tone={tone}
          data-segmented-value={currentValue}
          role="radiogroup"
        >
          {children}
        </div>
      </SegmentedContext.Provider>
    );
  },
);

SegmentedControl.displayName = "SegmentedControl";

export const SegmentedControlItem = forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  function SegmentedControlItem(
    {
      value,
      children,
      leadingVisual,
      disabled = false,
      className,
      onClick,
      onKeyDown,
      type = "button",
      ...buttonProps
    },
    ref,
  ) {
    const context = useSegmentedContext("SegmentedControlItem");
    const selected = context.value === value;

    const moveFocus = (
      event: KeyboardEvent<HTMLButtonElement>,
      target: "next" | "previous" | "first" | "last",
    ) => {
      const group = event.currentTarget.closest('[role="radiogroup"]');
      const enabledItems = group
        ? Array.from(
            group.querySelectorAll<HTMLButtonElement>('button[role="radio"]:not(:disabled)'),
          )
        : [];

      if (enabledItems.length === 0) {
        return;
      }

      const currentIndex = enabledItems.indexOf(event.currentTarget);
      let targetIndex = currentIndex;

      if (target === "first") {
        targetIndex = 0;
      } else if (target === "last") {
        targetIndex = enabledItems.length - 1;
      } else if (target === "next") {
        targetIndex = currentIndex + 1;

        if (targetIndex >= enabledItems.length) {
          targetIndex = context.loop ? 0 : enabledItems.length - 1;
        }
      } else {
        targetIndex = currentIndex - 1;

        if (targetIndex < 0) {
          targetIndex = context.loop ? enabledItems.length - 1 : 0;
        }
      }

      const nextItem = enabledItems[targetIndex];
      nextItem?.focus();

      const nextValue = nextItem?.dataset.segmentedValue;

      if (nextValue) {
        context.setValue(nextValue);
      }
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
      }
    };

    return (
      <button
        {...buttonProps}
        ref={ref}
        aria-checked={selected}
        className={joinClassNames(styles.item, selected && styles.selected, className)}
        data-segmented-value={value}
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event);

          if (!event.defaultPrevented) {
            context.setValue(value);
          }
        }}
        onKeyDown={handleKeyDown}
        role="radio"
        tabIndex={selected ? 0 : -1}
        type={type}
      >
        {leadingVisual ? (
          <span aria-hidden="true" className={styles.visual}>
            {leadingVisual}
          </span>
        ) : null}

        <span className={styles.label}>{children}</span>
      </button>
    );
  },
);

SegmentedControlItem.displayName = "SegmentedControlItem";
