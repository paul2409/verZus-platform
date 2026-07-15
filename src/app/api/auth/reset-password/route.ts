// VERZUS M4 STEP 4.5

import { resetPasswordRequestSchema } from "@/features/auth/api";
import { createMockAuthPostHandler } from "@/features/auth/server/mock-auth.http";
import { mockResetPassword } from "@/features/auth/server/mock-auth.service";

export const POST = createMockAuthPostHandler(resetPasswordRequestSchema, mockResetPassword);
