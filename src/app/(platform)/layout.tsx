// VERZUS M12.4 NOTIFICATION BADGE BRIDGE
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { NotificationAwarePlatformShell } from "@/features/notifications/mutations/shell/NotificationAwarePlatformShell";

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
  return <NotificationAwarePlatformShell>{children}</NotificationAwarePlatformShell>;
}
