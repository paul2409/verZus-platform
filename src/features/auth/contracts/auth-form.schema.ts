// VERZUS M4 STEP 4.2

import { z } from "zod";

const phonePattern = /^\+?[1-9]\d{6,14}$/;
const gamerTagPattern = /^[A-Za-z0-9_]+$/;
const verificationCodePattern = /^\d{6}$/;

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .email("Enter a valid email address.");

export const phoneSchema = z
  .string()
  .trim()
  .regex(phonePattern, "Enter a valid international phone number.");

export const authIdentifierSchema = z
  .string()
  .trim()
  .superRefine((value, context) => {
    if (value.length === 0) {
      context.addIssue({
        code: "custom",
        message: "Enter your email address or phone number.",
      });
      return;
    }

    if (!emailSchema.safeParse(value).success && !phoneSchema.safeParse(value).success) {
      context.addIssue({
        code: "custom",
        message: "Enter a valid email address or phone number.",
      });
    }
  });

export const gamerTagSchema = z
  .string()
  .trim()
  .min(3, "Gamer tag must contain at least 3 characters.")
  .max(16, "Gamer tag cannot exceed 16 characters.")
  .regex(gamerTagPattern, "Use only letters, numbers, and underscores.");

export const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password cannot exceed 128 characters.")
  .regex(/[a-z]/, "Include at least one lowercase letter.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/\d/, "Include at least one number.")
  .regex(/[^A-Za-z0-9]/, "Include at least one special character.");

export const loginFormSchema = z.object({
  identifier: authIdentifierSchema,
  password: z.string().min(1, "Enter your password."),
});

export const registerFormSchema = z
  .object({
    gamerTag: gamerTagSchema,
    email: emailSchema,
    phone: z.union([phoneSchema, z.literal("")]),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
    acceptedTerms: z.boolean().refine((value) => value, {
      message: "Accept the Terms and Community Rules to continue.",
    }),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

export const emailVerificationFormSchema = z.object({
  verificationCode: z
    .string()
    .trim()
    .regex(verificationCodePattern, "Enter the 6-digit verification code."),
});

export const forgotPasswordFormSchema = z.object({
  identifier: authIdentifierSchema,
});

export const resetPasswordFormSchema = z
  .object({
    resetToken: z.string().min(16, "Reset token is invalid."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

export type LoginFormInput = z.infer<typeof loginFormSchema>;
export type RegisterFormInput = z.infer<typeof registerFormSchema>;
export type EmailVerificationFormInput = z.infer<typeof emailVerificationFormSchema>;
export type ForgotPasswordFormInput = z.infer<typeof forgotPasswordFormSchema>;
export type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;
