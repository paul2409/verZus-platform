// VERZUS M11.7 PROFILE ACCOUNT-STATE SCHEMA

import { z } from "zod";

export const profileAccountStateResponseRawSchema = z
  .object({
    data: z
      .object({
        status: z.enum(["active", "empty", "suspended", "blocked"]),
        profile_id: z.string().min(1).nullable(),
        title: z.string().min(1),
        message: z.string().min(1),
        case_reference: z.string().min(1).nullable(),
        review_at_label: z.string().min(1).nullable(),
        can_edit_profile: z.boolean(),
        can_view_public_profile: z.boolean(),
      })
      .strict(),
    meta: z
      .object({
        request_id: z.string().min(1),
        source: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export const profileAccountStateErrorRawSchema = z
  .object({
    error: z
      .object({
        code: z.string().min(1),
        message: z.string().min(1),
        request_id: z.string().min(1),
        retryable: z.boolean(),
      })
      .strict(),
  })
  .strict();
