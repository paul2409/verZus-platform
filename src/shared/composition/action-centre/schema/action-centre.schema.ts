import { z } from "zod";

export const actionCentreItemSchema = z.object({
  id: z.string().min(1),
  kind: z.enum([
    "email_verification",
    "onboarding",
    "profile_readiness",
    "match_check_in",
    "match_lobby",
    "match_result_submit",
    "match_result_confirm",
    "match_dispute",
    "crew_invite",
    "reward_claim",
    "security_alert",
    "system_alert",
    "workflow_resume",
  ]),
  label: z.string().min(1),
  detail: z.string().min(1),
  reason: z.string().min(1),
  href: z.string().min(1),
  action_label: z.string().min(1),
  priority: z.enum(["critical", "high", "normal"]),
  tone: z.enum(["danger", "warning", "success", "info", "violet"]),
  score: z.number().finite(),
  deadline_at: z.string().datetime().nullable(),
  source_type: z.string().min(1),
  source_id: z.string().min(1),
});

export const actionCentreResponseSchema = z.object({
  data: z.object({
    items: z.array(actionCentreItemSchema),
  }),
  meta: z.object({
    request_id: z.string().min(1),
    fetched_at: z.string().datetime(),
    total: z.number().int().nonnegative(),
    critical_count: z.number().int().nonnegative(),
    high_count: z.number().int().nonnegative(),
  }),
});
