import type { NextRequest } from "next/server";

import { handlePersistentCompetitionEntryDiscoveryGet } from "@/features/competitions/entry/server";

export function GET(request: NextRequest) {
  return handlePersistentCompetitionEntryDiscoveryGet(request);
}
