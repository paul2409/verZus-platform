import {
  handleSmartDefaultsGet,
  handleSmartDefaultsPatch,
} from "@/shared/composition/smart-defaults/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleSmartDefaultsGet();
}

export async function PATCH(request: Request) {
  return handleSmartDefaultsPatch(request);
}
