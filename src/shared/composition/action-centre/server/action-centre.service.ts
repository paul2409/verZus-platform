import type { ActionCentreItem, ActionCentreSnapshot } from "@/lib/actions";

import type {
  ActionCentreSources,
  ActionMatchRow,
  ActionResumeRow,
} from "./action-centre.repository";

const MAX_ITEMS = 6;

function deadlineScore(deadlineAt: string | null, now: Date): number {
  if (!deadlineAt) return 0;
  const remaining = new Date(deadlineAt).getTime() - now.getTime();
  if (remaining <= 0) return 30;
  if (remaining <= 60 * 60 * 1_000) return 25;
  if (remaining <= 6 * 60 * 60 * 1_000) return 15;
  if (remaining <= 24 * 60 * 60 * 1_000) return 8;
  return 0;
}

function item(
  input: Omit<ActionCentreItem, "score"> & { baseScore: number },
  now: Date,
): ActionCentreItem {
  const { baseScore, ...rest } = input;
  return {
    ...rest,
    score: baseScore + deadlineScore(rest.deadlineAt, now),
  };
}

function resumeAction(row: ActionResumeRow, now: Date): ActionCentreItem {
  const isMatch = row.workflow_type === "match_result";
  return item(
    {
      id: `workflow-resume:${row.workflow_type}:${row.workflow_key}`,
      kind: "workflow_resume",
      label: `RESUME ${row.title}`,
      detail: row.summary,
      reason: "Saved workflow",
      href: row.resume_path,
      actionLabel: "Continue",
      priority: isMatch ? "high" : "normal",
      tone: isMatch ? "warning" : row.workflow_type === "crew_creation" ? "violet" : "info",
      baseScore: isMatch ? 93 : row.workflow_type === "competition_entry" ? 76 : 66,
      deadlineAt: null,
      sourceType: "workflow_checkpoint",
      sourceId: `${row.workflow_type}:${row.workflow_key}`,
    },
    now,
  );
}

function matchAction(row: ActionMatchRow, userId: string, now: Date): ActionCentreItem | null {
  if (row.state === "check-in-open" && !row.checked_in_at) {
    return item(
      {
        id: `match-check-in:${row.match_id}`,
        kind: "match_check_in",
        label: "CHECK IN NOW",
        detail: `${row.competition_name} is waiting for your check-in.`,
        reason: "Server deadline active",
        href: `/matches/${row.match_id}/check-in`,
        actionLabel: "Open check-in",
        priority: "critical",
        tone: "danger",
        baseScore: 115,
        deadlineAt: row.check_in_closes_at.toISOString(),
        sourceType: "match",
        sourceId: row.match_id,
      },
      now,
    );
  }

  if ((row.state === "both-ready" || row.state === "lobby-open") && !row.lobby_entered_at) {
    return item(
      {
        id: `match-lobby:${row.match_id}`,
        kind: "match_lobby",
        label: "ENTER MATCH LOBBY",
        detail: `${row.competition_name} is ready to begin.`,
        reason: "Both players ready",
        href: `/matches/${row.match_id}/lobby`,
        actionLabel: "Open lobby",
        priority: "high",
        tone: "warning",
        baseScore: 98,
        deadlineAt: row.match_starts_at.toISOString(),
        sourceType: "match",
        sourceId: row.match_id,
      },
      now,
    );
  }

  if ((row.state === "in-progress" || row.state === "submit-result") && !row.result_status) {
    return item(
      {
        id: `match-result-submit:${row.match_id}`,
        kind: "match_result_submit",
        label: "SUBMIT MATCH RESULT",
        detail: `Record the confirmed score for ${row.competition_name}.`,
        reason: "Result required",
        href: `/matches/${row.match_id}/result`,
        actionLabel: "Submit result",
        priority: "high",
        tone: "warning",
        baseScore: 96,
        deadlineAt: row.result_due_at.toISOString(),
        sourceType: "match",
        sourceId: row.match_id,
      },
      now,
    );
  }

  if (
    row.state === "awaiting-opponent-confirmation" &&
    row.result_status === "pending" &&
    row.submitted_by !== userId &&
    !row.confirmed_by
  ) {
    return item(
      {
        id: `match-result-confirm:${row.match_id}`,
        kind: "match_result_confirm",
        label: "CONFIRM MATCH RESULT",
        detail: `Your opponent submitted a result for ${row.competition_name}.`,
        reason: "Your confirmation is pending",
        href: `/matches/${row.match_id}/result`,
        actionLabel: "Review result",
        priority: "high",
        tone: "warning",
        baseScore: 102,
        deadlineAt: row.result_due_at.toISOString(),
        sourceType: "match",
        sourceId: row.match_id,
      },
      now,
    );
  }

  if (row.state === "disputed") {
    return item(
      {
        id: `match-dispute:${row.match_id}`,
        kind: "match_dispute",
        label: "REVIEW MATCH DISPUTE",
        detail: `${row.competition_name} requires dispute follow-up.`,
        reason: "Match result blocked",
        href: `/matches/${row.match_id}/dispute`,
        actionLabel: "Open dispute",
        priority: "high",
        tone: "danger",
        baseScore: 94,
        deadlineAt: null,
        sourceType: "match",
        sourceId: row.match_id,
      },
      now,
    );
  }

  return null;
}

export function rankActionCentreItems(items: readonly ActionCentreItem[]): ActionCentreItem[] {
  const unique = new Map<string, ActionCentreItem>();

  for (const candidate of items) {
    const key = `${candidate.kind}:${candidate.sourceType}:${candidate.sourceId}`;
    const existing = unique.get(key);
    if (!existing || candidate.score > existing.score) unique.set(key, candidate);
  }

  return [...unique.values()]
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.deadlineAt && right.deadlineAt) {
        return new Date(left.deadlineAt).getTime() - new Date(right.deadlineAt).getTime();
      }
      if (left.deadlineAt) return -1;
      if (right.deadlineAt) return 1;
      return left.id.localeCompare(right.id);
    })
    .slice(0, MAX_ITEMS);
}

export function buildActionCentreSnapshot(
  sources: ActionCentreSources,
  userId: string,
  now = new Date(),
): ActionCentreSnapshot {
  const candidates: ActionCentreItem[] = [];
  const profile = sources.profile;

  if (profile && !profile.email_verified) {
    candidates.push(
      item(
        {
          id: "profile:verify-email",
          kind: "email_verification",
          label: "VERIFY YOUR EMAIL",
          detail: "Confirm your account before entering protected competitions.",
          reason: "Account security blocker",
          href: "/verify-email",
          actionLabel: "Verify email",
          priority: "critical",
          tone: "danger",
          baseScore: 120,
          deadlineAt: null,
          sourceType: "user",
          sourceId: userId,
        },
        now,
      ),
    );
  } else if (profile && !profile.onboarding_complete) {
    candidates.push(
      item(
        {
          id: "profile:finish-onboarding",
          kind: "onboarding",
          label: "FINISH PLAYER SETUP",
          detail: "Complete the remaining setup before joining competition workflows.",
          reason: "Required prerequisite",
          href: "/onboarding",
          actionLabel: "Resume setup",
          priority: "high",
          tone: "warning",
          baseScore: 108,
          deadlineAt: null,
          sourceType: "user",
          sourceId: userId,
        },
        now,
      ),
    );
  }

  if (profile?.email_verified && profile.onboarding_complete) {
    const missing: string[] = [];
    if (!profile.has_profile || !profile.has_display_name || !profile.has_handle)
      missing.push("identity");
    if (!profile.has_game_identity) missing.push("game handle");
    if (!profile.has_location) missing.push("location");
    if (!profile.has_availability) missing.push("availability");

    if (missing.length > 0) {
      candidates.push(
        item(
          {
            id: "profile:readiness",
            kind: "profile_readiness",
            label: "COMPLETE PLAYER PROFILE",
            detail: `Add ${missing.join(", ")} to improve eligibility and matchmaking.`,
            reason: `${missing.length} readiness item${missing.length === 1 ? "" : "s"} missing`,
            href: "/profile/edit",
            actionLabel: "Complete profile",
            priority: "normal",
            tone: "info",
            baseScore: 55,
            deadlineAt: null,
            sourceType: "profile",
            sourceId: userId,
          },
          now,
        ),
      );
    }
  }

  const resumedMatchIds = new Set(
    sources.resumeCheckpoints
      .filter((checkpoint) => checkpoint.workflow_type === "match_result")
      .map((checkpoint) => checkpoint.workflow_key),
  );

  for (const checkpoint of sources.resumeCheckpoints) {
    candidates.push(resumeAction(checkpoint, now));
  }

  for (const row of sources.matches) {
    const action = matchAction(row, userId, now);
    if (action?.kind === "match_result_submit" && resumedMatchIds.has(row.match_id)) continue;
    if (action) candidates.push(action);
  }

  for (const invite of sources.crewInvites) {
    candidates.push(
      item(
        {
          id: `crew-invite:${invite.invite_id}`,
          kind: "crew_invite",
          label: `REVIEW ${invite.crew_name.toUpperCase()} INVITE`,
          detail: `You were invited as ${invite.role}.`,
          reason: "Crew decision pending",
          href: `/crews/${invite.crew_id}`,
          actionLabel: "Review invite",
          priority: "high",
          tone: "violet",
          baseScore: 86,
          deadlineAt: invite.expires_at.toISOString(),
          sourceType: "crew_invite",
          sourceId: invite.invite_id,
        },
        now,
      ),
    );
  }

  for (const reward of sources.rewards) {
    candidates.push(
      item(
        {
          id: `reward-claim:${reward.grant_id}`,
          kind: "reward_claim",
          label: "CLAIM AVAILABLE REWARD",
          detail: `${reward.reward_title} · ${reward.amount_label}`,
          reason: reward.expires_at ? "Reward can expire" : "Ready now",
          href: "/rewards",
          actionLabel: "Claim reward",
          priority: reward.expires_at ? "high" : "normal",
          tone: "success",
          baseScore: reward.expires_at ? 80 : 68,
          deadlineAt: reward.expires_at?.toISOString() ?? null,
          sourceType: "reward_grant",
          sourceId: reward.grant_id,
        },
        now,
      ),
    );
  }

  for (const notification of sources.notifications) {
    candidates.push(
      item(
        {
          id: `notification:${notification.notification_id}`,
          kind: notification.category === "security" ? "security_alert" : "system_alert",
          label: notification.title.toUpperCase(),
          detail: notification.description,
          reason:
            notification.category === "security"
              ? "Security action required"
              : "Platform action required",
          href: notification.href ?? "/notifications",
          actionLabel: notification.action_label ?? "Review alert",
          priority: notification.priority === "critical" ? "critical" : "high",
          tone: notification.category === "security" ? "danger" : "info",
          baseScore: notification.priority === "critical" ? 112 : 88,
          deadlineAt: notification.expires_at?.toISOString() ?? null,
          sourceType: "notification",
          sourceId: notification.notification_id,
        },
        now,
      ),
    );
  }

  const items = rankActionCentreItems(candidates);

  return {
    items,
    generatedAt: now.toISOString(),
    total: items.length,
    criticalCount: items.filter((candidate) => candidate.priority === "critical").length,
    highCount: items.filter((candidate) => candidate.priority === "high").length,
  };
}
