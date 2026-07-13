// VERZUS M4 STEP 4.1

import { z } from "zod";

import { authRoles, authStates } from "./auth-state";

export const authStateSchema = z.enum(authStates);
export const authRoleSchema = z.enum(authRoles);

export const authenticatedUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email().nullable(),
  phone: z.string().min(6).nullable(),
  role: authRoleSchema,
  emailVerified: z.boolean(),
  onboardingComplete: z.boolean(),
});

export const authSessionSchema = z.object({
  id: z.string().min(1),
  expiresAt: z.string().datetime(),
  refreshable: z.boolean(),
  deviceId: z.string().min(1).nullable(),
});

export const authSessionResponseSchema = z
  .object({
    state: authStateSchema,
    user: authenticatedUserSchema.nullable(),
    session: authSessionSchema.nullable(),
    restrictionReason: z.string().min(1).nullable(),
    requestId: z.string().min(1),
  })
  .superRefine((value, context) => {
    const requiresIdentity = [
      "authenticated",
      "email_unverified",
      "onboarding_incomplete",
      "suspended",
      "banned",
    ].includes(value.state);

    if (requiresIdentity && value.user === null) {
      context.addIssue({
        code: "custom",
        message: `State "${value.state}" requires a user.`,
        path: ["user"],
      });
    }

    const requiresSession = ["authenticated", "email_unverified", "onboarding_incomplete"].includes(
      value.state,
    );

    if (requiresSession && value.session === null) {
      context.addIssue({
        code: "custom",
        message: `State "${value.state}" requires a session.`,
        path: ["session"],
      });
    }

    if (
      (value.state === "suspended" || value.state === "banned") &&
      value.restrictionReason === null
    ) {
      context.addIssue({
        code: "custom",
        message: `State "${value.state}" requires a restriction reason.`,
        path: ["restrictionReason"],
      });
    }
  });

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
export type AuthSessionResponse = z.infer<typeof authSessionResponseSchema>;
