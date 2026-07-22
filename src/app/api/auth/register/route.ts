import { registerRequestSchema } from "@/features/auth/api";
import { createAuthPostHandler, readDeviceId } from "@/features/auth/server/auth.http";
import { registerAccountWithVerification } from "@/features/auth/server/auth.identity.service";

export const POST = createAuthPostHandler(registerRequestSchema, (input, request) =>
  registerAccountWithVerification(input, readDeviceId(request)),
);
