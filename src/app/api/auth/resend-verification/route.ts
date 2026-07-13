// VERZUS M4 STEP 4.5

import { resendVerificationRequestSchema } from "@/features/auth/api";
import { createMockAuthPostHandler } from "@/features/auth/server/mock-auth.http";
import { mockResendVerification } from "@/features/auth/server/mock-auth.service";

export const POST = createMockAuthPostHandler(
  resendVerificationRequestSchema,
  mockResendVerification,
);
