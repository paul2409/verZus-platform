import type { NextRequest } from "next/server";

import { handleCrewCollectionGet, handleCrewCreate } from "@/features/crews/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET(request: NextRequest) {
  return handleCrewCollectionGet(request);
}

export function POST(request: NextRequest) {
  return handleCrewCreate(request);
}
