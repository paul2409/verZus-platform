// VERZUS M12.2 MATCHES SEARCH RESOURCE
import type { NextRequest } from "next/server";
import { handleSearchResourceGet } from "@/features/search/resources/server";
export const dynamic = "force-dynamic";
export function GET(request: NextRequest) {
  return handleSearchResourceGet(request, "matches");
}
