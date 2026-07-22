import { handlePlayPlayerStatusGet } from "@/features/play/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return handlePlayPlayerStatusGet();
}
