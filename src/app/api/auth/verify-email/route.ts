import { verifyEmailRequestSchema } from "@/features/auth/api";
import { createAuthPostHandler, readSessionToken } from "@/features/auth/server/auth.http";
import { verifyCurrentEmail } from "@/features/auth/server/auth.identity.service";

export const POST = createAuthPostHandler(verifyEmailRequestSchema, (input, request) =>
  verifyCurrentEmail(readSessionToken(request), input),
);
