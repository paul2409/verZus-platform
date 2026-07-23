import { handleActionCentreGet } from "@/shared/composition/action-centre/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleActionCentreGet();
}
