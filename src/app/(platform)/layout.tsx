import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PlatformShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: {
    default: "Platform",
    template: "%s | VERZUS",
  },
};

type PlatformLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function PlatformLayout({ children }: PlatformLayoutProps) {
  return <PlatformShell>{children}</PlatformShell>;
}
