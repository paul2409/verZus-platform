// VERZUS M4 STEP 4.5

import { loginRequestSchema } from "@/features/auth/api";
import { createMockAuthPostHandler } from "@/features/auth/server/mock-auth.http";
import { mockLogin } from "@/features/auth/server/mock-auth.service";

export const POST = createMockAuthPostHandler(
  loginRequestSchema,
  mockLogin,
);
