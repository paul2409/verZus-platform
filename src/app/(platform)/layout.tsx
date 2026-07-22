import type { Metadata } from "next";
import type { ReactNode } from "react";

import { requireAuthenticatedServerSession } from "@/features/auth/server/auth-session.server";
import { NotificationAwarePlatformShell } from "@/features/notifications/mutations/shell/NotificationAwarePlatformShell";
import { getProductionPlatformShellProfile } from "@/features/platform-runtime/server";

export const metadata: Metadata = {
  title: {
    default: "Platform",
    template: "%s | VERZUS",
  },
};

type PlatformLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function PlatformLayout({ children }: PlatformLayoutProps) {
  const session = await requireAuthenticatedServerSession();
  const userId = session.user?.id;

  if (!userId) {
    throw new Error("Authenticated platform session is missing its user identity.");
  }

  const profile = await getProductionPlatformShellProfile(userId);

  return (
    <NotificationAwarePlatformShell profile={profile}>
      {children}
    </NotificationAwarePlatformShell>
  );
}
