import { z } from "zod";

import { proactiveRuleKeys } from "../model";

export const proactiveRunResponseSchema = z.object({
  data: z.object({
    run_id: z.string().uuid(),
    request_id: z.string().min(1),
    status: z.enum(["completed", "skipped", "disabled"]),
    trigger: z.enum(["api", "cli", "scheduler"]),
    candidate_count: z.number().int().nonnegative(),
    reminder_count: z.number().int().nonnegative(),
    created_count: z.number().int().nonnegative(),
    updated_count: z.number().int().nonnegative(),
    resolved_count: z.number().int().nonnegative(),
    started_at: z.string().datetime(),
    completed_at: z.string().datetime(),
  }),
  meta: z.object({
    request_id: z.string().min(1),
    rules: z.array(z.enum(proactiveRuleKeys)),
  }),
});
