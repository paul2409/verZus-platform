// VERZUS M4 STEP 4.2

import type { AuthState } from "../model";
import type { AuthFieldName, AuthFormStatus, AuthScreenId } from "./auth-form.types";

export interface AuthScreenFieldContract {
  name: AuthFieldName;
  label: string;
  autoComplete: string;
  inputMode: "email" | "numeric" | "search" | "tel" | "text" | "url" | "none";
  required: boolean;
}

export interface AuthScreenActionContract {
  label: string;
  href: string;
}

export interface AuthScreenContract {
  id: AuthScreenId;
  route: string;
  title: string;
  entryStates: readonly AuthState[];
  fields: readonly AuthScreenFieldContract[];
  supportedFormStates: readonly AuthFormStatus[];
  primaryActionLabel: string;
  secondaryAction: AuthScreenActionContract | null;
  rateLimited: boolean;
  passwordVisibility: boolean;
}

const commonFormStates = [
  "idle",
  "validating",
  "submitting",
  "success",
  "field_error",
  "submission_error",
  "rate_limited",
  "offline",
] as const satisfies readonly AuthFormStatus[];

export const authScreenContracts: Record<AuthScreenId, AuthScreenContract> = {
  login: {
    id: "login",
    route: "/login",
    title: "Welcome back",
    entryStates: ["anonymous", "authenticating"],
    fields: [
      {
        name: "identifier",
        label: "Email or phone",
        autoComplete: "username",
        inputMode: "email",
        required: true,
      },
      {
        name: "password",
        label: "Password",
        autoComplete: "current-password",
        inputMode: "text",
        required: true,
      },
    ],
    supportedFormStates: commonFormStates,
    primaryActionLabel: "Sign in",
    secondaryAction: {
      label: "Create account",
      href: "/register",
    },
    rateLimited: true,
    passwordVisibility: true,
  },
  register: {
    id: "register",
    route: "/register",
    title: "Create account",
    entryStates: ["anonymous"],
    fields: [
      {
        name: "gamerTag",
        label: "Gamer tag",
        autoComplete: "nickname",
        inputMode: "text",
        required: true,
      },
      {
        name: "email",
        label: "Email",
        autoComplete: "email",
        inputMode: "email",
        required: true,
      },
      {
        name: "phone",
        label: "Phone number",
        autoComplete: "tel",
        inputMode: "tel",
        required: false,
      },
      {
        name: "password",
        label: "Password",
        autoComplete: "new-password",
        inputMode: "text",
        required: true,
      },
      {
        name: "confirmPassword",
        label: "Confirm password",
        autoComplete: "new-password",
        inputMode: "text",
        required: true,
      },
      {
        name: "acceptedTerms",
        label: "Terms and Community Rules",
        autoComplete: "off",
        inputMode: "none",
        required: true,
      },
    ],
    supportedFormStates: commonFormStates,
    primaryActionLabel: "Create account",
    secondaryAction: {
      label: "Back to sign in",
      href: "/login",
    },
    rateLimited: true,
    passwordVisibility: true,
  },
  "email-verification": {
    id: "email-verification",
    route: "/verify-email",
    title: "Verify your email",
    entryStates: ["email_unverified"],
    fields: [
      {
        name: "verificationCode",
        label: "Verification code",
        autoComplete: "one-time-code",
        inputMode: "numeric",
        required: true,
      },
    ],
    supportedFormStates: commonFormStates,
    primaryActionLabel: "Verify",
    secondaryAction: {
      label: "Change email",
      href: "/register",
    },
    rateLimited: true,
    passwordVisibility: false,
  },
  "forgot-password": {
    id: "forgot-password",
    route: "/forgot-password",
    title: "Forgot password",
    entryStates: ["anonymous", "session_expired"],
    fields: [
      {
        name: "identifier",
        label: "Email or phone",
        autoComplete: "username",
        inputMode: "email",
        required: true,
      },
    ],
    supportedFormStates: commonFormStates,
    primaryActionLabel: "Send reset link",
    secondaryAction: {
      label: "Back to sign in",
      href: "/login",
    },
    rateLimited: true,
    passwordVisibility: false,
  },
  "reset-password": {
    id: "reset-password",
    route: "/reset-password",
    title: "Reset password",
    entryStates: ["anonymous", "session_expired"],
    fields: [
      {
        name: "resetToken",
        label: "Reset token",
        autoComplete: "off",
        inputMode: "text",
        required: true,
      },
      {
        name: "password",
        label: "New password",
        autoComplete: "new-password",
        inputMode: "text",
        required: true,
      },
      {
        name: "confirmPassword",
        label: "Confirm new password",
        autoComplete: "new-password",
        inputMode: "text",
        required: true,
      },
    ],
    supportedFormStates: commonFormStates,
    primaryActionLabel: "Update password",
    secondaryAction: {
      label: "Back to sign in",
      href: "/login",
    },
    rateLimited: true,
    passwordVisibility: true,
  },
  "session-expired": {
    id: "session-expired",
    route: "/session-expired",
    title: "Session expired",
    entryStates: ["session_expired"],
    fields: [],
    supportedFormStates: ["idle"],
    primaryActionLabel: "Sign in again",
    secondaryAction: {
      label: "Back to home",
      href: "/",
    },
    rateLimited: false,
    passwordVisibility: false,
  },
};

export function getAuthScreenContract(id: AuthScreenId): AuthScreenContract {
  return authScreenContracts[id];
}
