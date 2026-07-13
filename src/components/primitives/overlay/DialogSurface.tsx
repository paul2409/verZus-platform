"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

import styles from "./Overlay.module.css";
import { getFocusableElements, joinClassNames } from "./utils";

export type DialogKind = "modal" | "drawer";
export type DialogSize = "sm" | "md" | "lg";
export type DrawerSide = "left" | "right" | "bottom";

export type DialogSurfaceProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  closeOnBackdrop?: boolean;
  kind: DialogKind;
  size?: DialogSize;
  side?: DrawerSide;
  className?: string;
};

const sizeClasses: Record<DialogSize, string> = {
  sm: styles.dialogSizeSm!,
  md: styles.dialogSizeMd!,
  lg: styles.dialogSizeLg!,
};

const sideClasses: Record<DrawerSide, string> = {
  left: styles.drawerLeft!,
  right: styles.drawerRight!,
  bottom: styles.drawerBottom!,
};

export function DialogSurface({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  closeLabel = "Close",
  closeOnBackdrop = true,
  kind,
  size = "md",
  side = "right",
  className,
}: DialogSurfaceProps) {
  const titleId = useId();
  const descriptionId = useId();
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = surfaceRef.current ? getFocusableElements(surfaceRef.current) : [];
    (focusable[0] ?? surfaceRef.current)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }

      if (event.key !== "Tab" || !surfaceRef.current) {
        return;
      }

      const elements = getFocusableElements(surfaceRef.current);
      if (elements.length === 0) {
        event.preventDefault();
        surfaceRef.current.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [onOpenChange, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.currentTarget === event.target) {
      onOpenChange(false);
    }
  };

  return createPortal(
    <div className={styles.backdrop} data-overlay-kind={kind} onMouseDown={handleBackdropClick}>
      <div
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={joinClassNames(
          styles.dialog,
          kind === "modal" ? styles.modal : styles.drawer,
          sizeClasses[size],
          kind === "drawer" && sideClasses[side],
          className,
        )}
        data-dialog-kind={kind}
        data-dialog-size={size}
        data-drawer-side={kind === "drawer" ? side : undefined}
        ref={surfaceRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className={styles.dialogHeader}>
          <div>
            <h2 className={styles.dialogTitle} id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className={styles.dialogDescription} id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>

          <button
            aria-label={closeLabel}
            className={styles.dialogClose}
            onClick={() => onOpenChange(false)}
            type="button"
          >
            ×
          </button>
        </header>

        <div className={styles.dialogBody}>{children}</div>
        {footer ? <footer className={styles.dialogFooter}>{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
