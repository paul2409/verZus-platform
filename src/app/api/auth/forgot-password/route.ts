import { forgotPasswordRequestSchema } from "@/features/auth/api";
import { createAuthPostHandler } from "@/features/auth/server/auth.http";
import { requestPasswordReset } from "@/features/auth/server/auth.identity.service";

export const POST = createAuthPostHandler(forgotPasswordRequestSchema, (input) =>
  requestPasswordReset(input),
);
