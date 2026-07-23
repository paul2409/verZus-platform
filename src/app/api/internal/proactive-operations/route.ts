import type { NextRequest } from "next/server";

import { handleProactiveOperationsPost } from "@/shared/composition/proactive-operations/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleProactiveOperationsPost(request);
}
