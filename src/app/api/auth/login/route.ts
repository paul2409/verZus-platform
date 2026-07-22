import { loginRequestSchema } from "@/features/auth/api";
import { createAuthPostHandler, readDeviceId } from "@/features/auth/server/auth.http";
import { loginAccount } from "@/features/auth/server/auth.service";

export const POST = createAuthPostHandler(loginRequestSchema, (input, request) =>
  loginAccount(input, readDeviceId(request)),
);
