// VERZUS M4 STEP 4.5

import { verifyEmailRequestSchema } from "@/features/auth/api";
import { createMockAuthPostHandler } from "@/features/auth/server/mock-auth.http";
import { mockVerifyEmail } from "@/features/auth/server/mock-auth.service";

export const POST = createMockAuthPostHandler(verifyEmailRequestSchema, mockVerifyEmail);
