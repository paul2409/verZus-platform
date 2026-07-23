import { competitionEntryResumeRequestSchema } from "@/features/competitions/entry/resume";
import { crewCreationResumeRequestSchema } from "@/features/crews/creation/resume";
import { matchResultResumeRequestSchema } from "@/features/matches/operations/resume";
import type { WorkflowResumeType } from "@/lib/workflow-resume";

export class WorkflowResumeValidationError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Record<string, string[]>,
  ) {
    super(message);
    this.name = "WorkflowResumeValidationError";
  }
}

export interface WorkflowResumePolicyResult {
  currentStep: string;
  payload: Record<string, unknown>;
  resumePath: string;
  title: string;
  summary: string;
  expiresAt: Date;
}

function invalidKey(message: string): never {
  throw new WorkflowResumeValidationError(message, { workflow_key: [message] });
}

function safeKey(key: string): string {
  const value = key.trim();
  if (!value || value.length > 120 || value.includes("/") || value.includes("\\")) {
    invalidKey("The workflow key is invalid.");
  }
  return value;
}

function issueMap(
  issues: readonly { path: PropertyKey[]; message: string }[],
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.length > 0 ? issue.path.map(String).join(".") : "request";
    errors[key] ??= [];
    errors[key]!.push(issue.message);
  }
  return errors;
}

export function resolveWorkflowResumePolicy(
  type: WorkflowResumeType,
  keyInput: string,
  raw: unknown,
  now = new Date(),
): WorkflowResumePolicyResult {
  const key = safeKey(keyInput);

  if (type === "crew_creation") {
    if (key !== "current") invalidKey("Crew creation uses the current workflow key.");
    const parsed = crewCreationResumeRequestSchema.safeParse(raw);
    if (!parsed.success) {
      throw new WorkflowResumeValidationError(
        "The Crew creation checkpoint is invalid.",
        issueMap(parsed.error.issues),
      );
    }
    const name = parsed.data.payload.name.trim();
    return {
      currentStep: parsed.data.current_step,
      payload: parsed.data.payload,
      resumePath: `/crews/create?step=${parsed.data.current_step}&resume=1`,
      title: "CREW CREATION",
      summary: name
        ? `Continue ${name} from the ${parsed.data.current_step} step.`
        : `Continue Crew setup from the ${parsed.data.current_step} step.`,
      expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1_000),
    };
  }

  if (type === "competition_entry") {
    const parsed = competitionEntryResumeRequestSchema.safeParse(raw);
    if (!parsed.success) {
      throw new WorkflowResumeValidationError(
        "The competition entry checkpoint is invalid.",
        issueMap(parsed.error.issues),
      );
    }
    return {
      currentStep: parsed.data.current_step,
      payload: parsed.data.payload,
      resumePath: `/compete/${encodeURIComponent(key)}?resume=entry#entry-control`,
      title: "COMPETITION ENTRY",
      summary: parsed.data.payload.accepted
        ? "Return to the final entry confirmation."
        : "Review the entry terms and finish registration.",
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1_000),
    };
  }

  const parsed = matchResultResumeRequestSchema.safeParse(raw);
  if (!parsed.success) {
    throw new WorkflowResumeValidationError(
      "The match result checkpoint is invalid.",
      issueMap(parsed.error.issues),
    );
  }
  return {
    currentStep: parsed.data.current_step,
    payload: parsed.data.payload,
    resumePath: `/matches/${encodeURIComponent(key)}#result-control`,
    title: "MATCH RESULT",
    summary: `Resume the saved ${parsed.data.payload.homeScore}-${parsed.data.payload.awayScore} result draft.`,
    expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1_000),
  };
}
