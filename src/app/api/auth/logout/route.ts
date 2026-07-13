// VERZUS M4 STEP 4.5

import { createMockAuthNoBodyHandler } from "@/features/auth/server/mock-auth.http";
import { mockLogout } from "@/features/auth/server/mock-auth.service";

export const POST = createMockAuthNoBodyHandler(mockLogout);
