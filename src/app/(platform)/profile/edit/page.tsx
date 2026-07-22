import { notFound } from "next/navigation";

import { requireAuthenticatedServerSession } from "@/features/auth/server/auth-session.server";
import { readProfileEditSnapshot } from "@/features/profiles/edit/server";
import { ProfileEditScreen } from "@/features/profiles/edit";

export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const session = await requireAuthenticatedServerSession();
  const snapshot = await readProfileEditSnapshot(session.user!.id);
  if (!snapshot) notFound();
  return <ProfileEditScreen initialSnapshot={snapshot} />;
}
