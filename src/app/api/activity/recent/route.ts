import { handlePlayRecentActivityGet } from "@/features/activity/feed/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return handlePlayRecentActivityGet();
}
