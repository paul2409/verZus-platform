// VERZUS M4 STEP 4.5

import { forgotPasswordRequestSchema } from "@/features/auth/api";
import { createMockAuthPostHandler } from "@/features/auth/server/mock-auth.http";
import { mockForgotPassword } from "@/features/auth/server/mock-auth.service";

export const POST = createMockAuthPostHandler(
  forgotPasswordRequestSchema,
  mockForgotPassword,
);
