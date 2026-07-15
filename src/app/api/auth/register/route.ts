// VERZUS M4 STEP 4.5

import { registerRequestSchema } from "@/features/auth/api";
import { createMockAuthPostHandler } from "@/features/auth/server/mock-auth.http";
import { mockRegister } from "@/features/auth/server/mock-auth.service";

export const POST = createMockAuthPostHandler(registerRequestSchema, mockRegister);
