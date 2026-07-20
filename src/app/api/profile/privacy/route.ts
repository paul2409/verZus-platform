// VERZUS M11.7 PROFILE PRIVACY API ROUTE

import type { NextRequest } from "next/server";

import {
  handleProfilePrivacyGet,
  handleProfilePrivacyPatch,
} from "@/features/profiles/privacy/server";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return handleProfilePrivacyGet(request);
}

export function PATCH(request: NextRequest) {
  return handleProfilePrivacyPatch(request);
}
