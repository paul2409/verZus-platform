// VERZUS M6.6 ENTRY LIFECYCLE GUARD

import type { NextRequest } from "next/server";

import {
  guardCompetitionEntryRequest,
  type CompetitionRouteContext,
} from "@/features/competitions/lifecycle/server";
import { POST as m65Post } from "./route.m6-5";

type M65Post = (
  request: NextRequest,
  context: CompetitionRouteContext,
) => Response | Promise<Response>;

const delegateM65Post = m65Post as M65Post;

export async function POST(
  request: NextRequest,
  context: CompetitionRouteContext,
): Promise<Response> {
  const blocked = await guardCompetitionEntryRequest(request, context);
  if (blocked) return blocked;

  return delegateM65Post(request, context);
}
