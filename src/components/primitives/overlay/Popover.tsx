"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import styles from "./Overlay.module.css";
import { joinClassNames } from "./utils";

type PopoverContextValue = {
  contentId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used inside Popover.");
  }
  return context;
}

export type PopoverProps = {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Popover({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: PopoverProps) {
  const contentId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  const value = useMemo(
    () => ({ contentId, open, setOpen, triggerRef }),
    [contentId, open, setOpen],
  );

  return (
    <PopoverContext.Provider value={value}>
      <div className={styles.popoverRoot} ref={rootRef}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export type PopoverTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PopoverTrigger({ className, onClick, ...buttonProps }: PopoverTriggerProps) {
  const { contentId, open, setOpen, triggerRef } = usePopoverContext();

  return (
    <button
      {...buttonProps}
      aria-controls={contentId}
      aria-expanded={open}
      className={joinClassNames(styles.popoverTrigger, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(!open);
        }
      }}
      ref={triggerRef}
      type={buttonProps.type ?? "button"}
    />
  );
}

export type PopoverContentProps = HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end";
};

const alignClasses = {
  start: styles.popoverAlignStart!,
  center: styles.popoverAlignCenter!,
  end: styles.popoverAlignEnd!,
};

export function PopoverContent({ align = "end", className, ...divProps }: PopoverContentProps) {
  const { contentId, open } = usePopoverContext();

  if (!open) {
    return null;
  }

  return (
    <div
      {...divProps}
      className={joinClassNames(styles.popoverContent, alignClasses[align], className)}
      id={contentId}
      role={divProps.role ?? "dialog"}
    />
  );
}
