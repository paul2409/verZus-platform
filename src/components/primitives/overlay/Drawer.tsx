"use client";

import type { ComponentProps } from "react";

import { DialogSurface } from "./DialogSurface";

export type DrawerProps = Omit<ComponentProps<typeof DialogSurface>, "kind">;

export function Drawer(props: DrawerProps) {
  return <DialogSurface {...props} kind="drawer" />;
}
