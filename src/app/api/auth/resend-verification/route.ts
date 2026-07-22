import { resendVerificationRequestSchema } from "@/features/auth/api";
import { createAuthPostHandler, readSessionToken } from "@/features/auth/server/auth.http";
import { resendCurrentVerification } from "@/features/auth/server/auth.identity.service";

export const POST = createAuthPostHandler(resendVerificationRequestSchema, (input, request) =>
  resendCurrentVerification(readSessionToken(request), input),
);
