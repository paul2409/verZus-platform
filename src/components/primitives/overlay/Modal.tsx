"use client";

import type { ComponentProps } from "react";

import { DialogSurface } from "./DialogSurface";

export type ModalProps = Omit<ComponentProps<typeof DialogSurface>, "kind" | "side">;

export function Modal(props: ModalProps) {
  return <DialogSurface {...props} kind="modal" />;
}
