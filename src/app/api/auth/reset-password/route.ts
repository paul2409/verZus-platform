import { resetPasswordRequestSchema } from "@/features/auth/api";
import { createAuthPostHandler } from "@/features/auth/server/auth.http";
import { resetAccountPassword } from "@/features/auth/server/auth.identity.service";

export const POST = createAuthPostHandler(resetPasswordRequestSchema, (input) =>
  resetAccountPassword(input),
);
