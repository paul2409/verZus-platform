import "server-only";

import type { QueryResultRow } from "pg";

import { queryDatabase } from "@/lib/db";

export type ActionMatchRow = QueryResultRow & {
  match_id: string;
  state: string;
  competition_name: string;
  check_in_closes_at: Date;
  match_starts_at: Date;
  result_due_at: Date;
  checked_in_at: Date | null;
  lobby_entered_at: Date | null;
  result_status: string | null;
  submitted_by: string | null;
  confirmed_by: string | null;
};

export type ActionCrewInviteRow = QueryResultRow & {
  invite_id: string;
  crew_id: string;
  crew_name: string;
  role: string;
  expires_at: Date;
};

export type ActionRewardRow = QueryResultRow & {
  grant_id: string;
  reward_title: string;
  amount_label: string;
  expires_at: Date | null;
};

export type ActionProfileRow = QueryResultRow & {
  email_verified: boolean;
  onboarding_complete: boolean;
  has_profile: boolean;
  has_display_name: boolean;
  has_handle: boolean;
  has_location: boolean;
  has_game_identity: boolean;
  has_availability: boolean;
};

export type ActionNotificationRow = QueryResultRow & {
  notification_id: string;
  title: string;
  description: string;
  category: "security" | "system";
  priority: "critical" | "high" | "normal" | "low";
  href: string | null;
  action_label: string | null;
  expires_at: Date | null;
};

export type ActionResumeRow = QueryResultRow & {
  workflow_type: "crew_creation" | "competition_entry" | "match_result";
  workflow_key: string;
  resume_path: string;
  title: string;
  summary: string;
  updated_at: Date;
};

export interface ActionCentreSources {
  matches: ActionMatchRow[];
  crewInvites: ActionCrewInviteRow[];
  rewards: ActionRewardRow[];
  profile: ActionProfileRow | null;
  notifications: ActionNotificationRow[];
  resumeCheckpoints: ActionResumeRow[];
}

export async function readActionCentreSources(userId: string): Promise<ActionCentreSources> {
  const [matches, crewInvites, rewards, profile, notifications, resumeCheckpoints] =
    await Promise.all([
      queryDatabase<ActionMatchRow>(
        `SELECT
         match.id AS match_id,
         match.state,
         COALESCE(competition.name, match.round_label) AS competition_name,
         match.check_in_closes_at,
         match.match_starts_at,
         match.result_due_at,
         participant.checked_in_at,
         participant.lobby_entered_at,
         result.status AS result_status,
         result.submitted_by::text AS submitted_by,
         result.confirmed_by::text AS confirmed_by
       FROM match_participants AS participant
       INNER JOIN matches AS match ON match.id = participant.match_id
       LEFT JOIN competitions AS competition ON competition.id = match.competition_id
       LEFT JOIN match_results AS result ON result.match_id = match.id
       WHERE participant.user_id = $1::uuid
         AND match.state NOT IN ('result-confirmed', 'forfeit', 'cancelled', 'completed')
       ORDER BY LEAST(match.check_in_closes_at, match.match_starts_at, match.result_due_at) ASC
       LIMIT 8`,
        [userId],
      ),
      queryDatabase<ActionCrewInviteRow>(
        `SELECT
         invite.id::text AS invite_id,
         invite.crew_id::text AS crew_id,
         crew.name AS crew_name,
         invite.role,
         invite.expires_at
       FROM crew_invites AS invite
       INNER JOIN crews AS crew ON crew.id = invite.crew_id
       WHERE invite.user_id = $1::uuid
         AND invite.status = 'pending'
         AND invite.expires_at > now()
       ORDER BY invite.expires_at ASC
       LIMIT 5`,
        [userId],
      ),
      queryDatabase<ActionRewardRow>(
        `SELECT
         grant.id::text AS grant_id,
         definition.title AS reward_title,
         definition.amount_label,
         grant.expires_at
       FROM reward_grants AS grant
       INNER JOIN reward_definitions AS definition ON definition.id = grant.reward_id
       WHERE grant.user_id = $1::uuid
         AND grant.state = 'claimable'
         AND (grant.expires_at IS NULL OR grant.expires_at > now())
       ORDER BY grant.expires_at ASC NULLS LAST, grant.created_at ASC
       LIMIT 5`,
        [userId],
      ),
      queryDatabase<ActionProfileRow>(
        `SELECT
         (user_account.email_verified_at IS NOT NULL) AS email_verified,
         (user_account.onboarding_completed_at IS NOT NULL) AS onboarding_complete,
         (profile.user_id IS NOT NULL) AS has_profile,
         (NULLIF(BTRIM(profile.display_name), '') IS NOT NULL) AS has_display_name,
         (NULLIF(BTRIM(profile.handle), '') IS NOT NULL) AS has_handle,
         (NULLIF(BTRIM(profile.location_label), '') IS NOT NULL) AS has_location,
         EXISTS (
           SELECT 1 FROM player_game_identities AS identity
           WHERE identity.user_id = user_account.id
         ) AS has_game_identity,
         EXISTS (
           SELECT 1 FROM player_availability AS availability
           WHERE availability.user_id = user_account.id
         ) AS has_availability
       FROM users AS user_account
       LEFT JOIN player_profiles AS profile ON profile.user_id = user_account.id
       WHERE user_account.id = $1::uuid
       LIMIT 1`,
        [userId],
      ),
      queryDatabase<ActionNotificationRow>(
        `SELECT
         notification.id::text AS notification_id,
         notification.title,
         notification.description,
         notification.category,
         notification.priority,
         notification.href,
         notification.action_label,
         notification.expires_at
       FROM notifications AS notification
       WHERE notification.user_id = $1::uuid
         AND notification.state = 'unread'
         AND notification.category IN ('security', 'system')
         AND notification.priority IN ('critical', 'high')
         AND (notification.expires_at IS NULL OR notification.expires_at > now())
       ORDER BY
         CASE notification.priority WHEN 'critical' THEN 0 ELSE 1 END,
         notification.created_at DESC
       LIMIT 5`,
        [userId],
      ),
      queryDatabase<ActionResumeRow>(
        `SELECT workflow_type, workflow_key, resume_path, title, summary, updated_at
         FROM workflow_resume_checkpoints
        WHERE user_id = $1::uuid
          AND expires_at > now()
        ORDER BY updated_at DESC
        LIMIT 6`,
        [userId],
      ),
    ]);

  return {
    matches: matches.rows,
    crewInvites: crewInvites.rows,
    rewards: rewards.rows,
    profile: profile.rows[0] ?? null,
    notifications: notifications.rows,
    resumeCheckpoints: resumeCheckpoints.rows,
  };
}
