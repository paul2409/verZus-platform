// VERZUS M4 STEP 4.6

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decideAuthRouteAccess } from "@/features/auth/server/auth-route-policy";
import {
  authStateFromMockSession,
  MOCK_SESSION_COOKIE,
} from "@/features/auth/server/mock-auth.service";

export function proxy(request: NextRequest): NextResponse {
  const cookieValue = request.cookies.get(MOCK_SESSION_COOKIE)?.value ?? null;
  const state = authStateFromMockSession(cookieValue);
  const decision = decideAuthRouteAccess(request.nextUrl.pathname, state, request.nextUrl.search);

  if (decision.action === "allow") return NextResponse.next();
  return NextResponse.redirect(new URL(decision.destination, request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\..*).*)"],
};
