import "server-only";

import type { PoolClient, QueryResultRow } from "pg";

import { queryDatabase } from "@/lib/db";

import type {
  ProactiveReminder,
  ProactiveRuleKey,
  ProactiveSignal,
  ProactiveTriggerSource,
} from "../model";

type SignalRow = QueryResultRow & {
  user_id: string;
  source_id: string;
  subject: string;
  detail: string;
  href: string;
  action_label: string;
  due_at: Date | null;
  expires_at: Date | null;
};

type RunRow = QueryResultRow & { id: string; started_at: Date };
type LockRow = QueryResultRow & { acquired: boolean };
type UpsertCountRow = QueryResultRow & { created_count: string; updated_count: string };
type ResolveCountRow = QueryResultRow & { resolved_count: string };

function mapRows(rule: ProactiveRuleKey, rows: SignalRow[]): ProactiveSignal[] {
  return rows.map((row) => ({
    rule,
    userId: row.user_id,
    sourceId: row.source_id,
    subject: row.subject,
    detail: row.detail,
    href: row.href,
    actionLabel: row.action_label,
    dueAt: row.due_at,
    expiresAt: row.expires_at,
  }));
}

async function readRule(
  client: PoolClient,
  rule: ProactiveRuleKey,
  sql: string,
  now: Date,
  limit: number,
): Promise<ProactiveSignal[]> {
  const result = await client.query<SignalRow>(sql, [now, limit]);
  return mapRows(rule, result.rows);
}

export async function beginProactiveRun(input: {
  requestId: string;
  trigger: ProactiveTriggerSource;
  releaseSha: string;
}): Promise<{ id: string; startedAt: Date }> {
  const result = await queryDatabase<RunRow>(
    `INSERT INTO proactive_operation_runs (request_id, trigger_source, release_sha)
     VALUES ($1, $2, $3)
     RETURNING id::text, started_at`,
    [input.requestId, input.trigger, input.releaseSha],
  );
  const row = result.rows[0];
  if (!row) throw new Error("PROACTIVE_RUN_CREATE_FAILED");
  return { id: row.id, startedAt: row.started_at };
}

export async function finishProactiveRun(input: {
  runId: string;
  status: "completed" | "skipped" | "disabled";
  candidateCount: number;
  reminderCount: number;
  createdCount: number;
  updatedCount: number;
  resolvedCount: number;
  completedAt: Date;
}): Promise<void> {
  await queryDatabase(
    `UPDATE proactive_operation_runs
        SET status = $2,
            candidate_count = $3,
            reminder_count = $4,
            created_count = $5,
            updated_count = $6,
            resolved_count = $7,
            completed_at = $8
      WHERE id = $1::uuid`,
    [
      input.runId,
      input.status,
      input.candidateCount,
      input.reminderCount,
      input.createdCount,
      input.updatedCount,
      input.resolvedCount,
      input.completedAt,
    ],
  );
}

export async function failProactiveRun(input: {
  runId: string;
  errorCode: string;
  completedAt: Date;
}): Promise<void> {
  await queryDatabase(
    `UPDATE proactive_operation_runs
        SET status = 'failed', error_code = $2, completed_at = $3
      WHERE id = $1::uuid`,
    [input.runId, input.errorCode, input.completedAt],
  );
}

export async function acquireProactiveRunLock(client: PoolClient): Promise<boolean> {
  const result = await client.query<LockRow>(
    `SELECT pg_try_advisory_xact_lock(hashtext('verzus:proactive-operations')) AS acquired`,
  );
  return result.rows[0]?.acquired ?? false;
}

export async function readProactiveSignals(
  client: PoolClient,
  now: Date,
  perRuleLimit: number,
): Promise<ProactiveSignal[]> {
  const signals: ProactiveSignal[] = [];

  signals.push(
    ...(await readRule(
      client,
      "match_check_in",
      `SELECT
         participant.user_id::text AS user_id,
         match.id::text AS source_id,
         COALESCE(competition.name, match.round_label) AS subject,
         'Your scheduled match is waiting for your check-in.' AS detail,
         '/matches/' || match.id::text || '/check-in' AS href,
         'Check in now' AS action_label,
         match.check_in_closes_at AS due_at,
         match.check_in_closes_at AS expires_at
       FROM match_participants AS participant
       INNER JOIN matches AS match ON match.id = participant.match_id
       LEFT JOIN competitions AS competition ON competition.id = match.competition_id
       LEFT JOIN notification_settings AS settings ON settings.user_id = participant.user_id
       WHERE match.state = 'check-in-open'
         AND participant.checked_in_at IS NULL
         AND match.check_in_closes_at > $1
         AND match.check_in_closes_at <= $1 + interval '24 hours'
         AND COALESCE(settings.match_enabled, true)
       ORDER BY match.check_in_closes_at ASC
       LIMIT $2`,
      now,
      perRuleLimit,
    )),
  );

  signals.push(
    ...(await readRule(
      client,
      "match_lobby_ready",
      `SELECT
         participant.user_id::text AS user_id,
         match.id::text AS source_id,
         COALESCE(competition.name, match.round_label) AS subject,
         'Both players are ready. Enter the server-issued lobby when you are prepared.' AS detail,
         '/matches/' || match.id::text || '/lobby' AS href,
         'Enter lobby' AS action_label,
         match.match_starts_at AS due_at,
         match.result_due_at AS expires_at
       FROM match_participants AS participant
       INNER JOIN matches AS match ON match.id = participant.match_id
       LEFT JOIN competitions AS competition ON competition.id = match.competition_id
       LEFT JOIN notification_settings AS settings ON settings.user_id = participant.user_id
       WHERE match.state IN ('both-ready', 'lobby-open')
         AND participant.lobby_entered_at IS NULL
         AND match.result_due_at > $1
         AND COALESCE(settings.match_enabled, true)
       ORDER BY match.match_starts_at ASC
       LIMIT $2`,
      now,
      perRuleLimit,
    )),
  );

  signals.push(
    ...(await readRule(
      client,
      "match_result_confirmation",
      `SELECT
         participant.user_id::text AS user_id,
         match.id::text AS source_id,
         COALESCE(competition.name, match.round_label) AS subject,
         'Your opponent submitted a result. Confirm it or open a dispute before the result deadline.' AS detail,
         '/matches/' || match.id::text || '/result' AS href,
         'Review result' AS action_label,
         match.result_due_at AS due_at,
         match.result_due_at AS expires_at
       FROM match_results AS result
       INNER JOIN matches AS match ON match.id = result.match_id
       INNER JOIN match_participants AS participant ON participant.match_id = match.id
       LEFT JOIN competitions AS competition ON competition.id = match.competition_id
       LEFT JOIN notification_settings AS settings ON settings.user_id = participant.user_id
       WHERE result.status = 'pending'
         AND participant.user_id <> result.submitted_by
         AND result.confirmed_by IS NULL
         AND match.result_due_at > $1
         AND COALESCE(settings.match_enabled, true)
       ORDER BY match.result_due_at ASC
       LIMIT $2`,
      now,
      perRuleLimit,
    )),
  );

  signals.push(
    ...(await readRule(
      client,
      "competition_registration_closing",
      `SELECT
         checkpoint.user_id::text AS user_id,
         competition.id::text AS source_id,
         competition.name AS subject,
         'You started this entry but have not confirmed it. Registration is closing.' AS detail,
         checkpoint.resume_path AS href,
         'Resume entry' AS action_label,
         competition.registration_closes_at AS due_at,
         competition.registration_closes_at AS expires_at
       FROM workflow_resume_checkpoints AS checkpoint
       INNER JOIN competitions AS competition
         ON competition.id = checkpoint.workflow_key
       LEFT JOIN notification_settings AS settings ON settings.user_id = checkpoint.user_id
       WHERE checkpoint.workflow_type = 'competition_entry'
         AND checkpoint.expires_at > $1
         AND competition.lifecycle = 'registration_open'
         AND competition.registration_closes_at > $1
         AND competition.registration_closes_at <= $1 + interval '24 hours'
         AND COALESCE(settings.competition_enabled, true)
         AND NOT EXISTS (
           SELECT 1
           FROM competition_entries AS entry
           WHERE entry.user_id = checkpoint.user_id
             AND entry.competition_id = competition.id
             AND entry.state IN ('confirmed', 'waitlisted')
         )
       ORDER BY competition.registration_closes_at ASC
       LIMIT $2`,
      now,
      perRuleLimit,
    )),
  );

  signals.push(
    ...(await readRule(
      client,
      "crew_invite_expiring",
      `SELECT
         invite.user_id::text AS user_id,
         invite.id::text AS source_id,
         crew.name AS subject,
         crew.name || ' invited you to join as ' || invite.role || '. Review the invitation before it expires.' AS detail,
         '/crews/' || crew.id::text AS href,
         'Review invite' AS action_label,
         invite.expires_at AS due_at,
         invite.expires_at AS expires_at
       FROM crew_invites AS invite
       INNER JOIN crews AS crew ON crew.id = invite.crew_id
       LEFT JOIN notification_settings AS settings ON settings.user_id = invite.user_id
       WHERE invite.status = 'pending'
         AND invite.expires_at > $1
         AND invite.expires_at <= $1 + interval '48 hours'
         AND COALESCE(settings.crew_enabled, true)
       ORDER BY invite.expires_at ASC
       LIMIT $2`,
      now,
      perRuleLimit,
    )),
  );

  signals.push(
    ...(await readRule(
      client,
      "reward_claimable",
      `SELECT
         grant.user_id::text AS user_id,
         grant.id::text AS source_id,
         definition.title AS subject,
         definition.title || ' · ' || definition.amount_label || ' is ready to claim.' AS detail,
         '/rewards' AS href,
         'Claim reward' AS action_label,
         grant.expires_at AS due_at,
         grant.expires_at AS expires_at
       FROM reward_grants AS grant
       INNER JOIN reward_definitions AS definition ON definition.id = grant.reward_id
       LEFT JOIN notification_settings AS settings ON settings.user_id = grant.user_id
       WHERE grant.state = 'claimable'
         AND (grant.expires_at IS NULL OR grant.expires_at > $1)
         AND (grant.expires_at IS NULL OR grant.expires_at <= $1 + interval '72 hours')
         AND COALESCE(settings.reward_enabled, true)
       ORDER BY grant.expires_at ASC NULLS LAST, grant.created_at ASC
       LIMIT $2`,
      now,
      perRuleLimit,
    )),
  );

  signals.push(
    ...(await readRule(
      client,
      "profile_readiness",
      `SELECT
         account.id::text AS user_id,
         account.id::text AS source_id,
         'Player profile' AS subject,
         'Add ' || CONCAT_WS(', ',
           CASE WHEN profile.user_id IS NULL OR NULLIF(BTRIM(profile.display_name), '') IS NULL THEN 'display name' END,
           CASE WHEN profile.user_id IS NULL OR NULLIF(BTRIM(profile.handle), '') IS NULL THEN 'player handle' END,
           CASE WHEN profile.user_id IS NULL OR NULLIF(BTRIM(profile.location_label), '') IS NULL THEN 'location' END,
           CASE WHEN NOT EXISTS (
             SELECT 1 FROM player_game_identities AS identity WHERE identity.user_id = account.id
           ) THEN 'game identity' END,
           CASE WHEN NOT EXISTS (
             SELECT 1 FROM player_availability AS availability WHERE availability.user_id = account.id
           ) THEN 'availability' END
         ) || ' before entering competitions that require those details.' AS detail,
         '/profile/edit' AS href,
         'Complete profile' AS action_label,
         NULL::timestamptz AS due_at,
         $1 + interval '7 days' AS expires_at
       FROM users AS account
       LEFT JOIN player_profiles AS profile ON profile.user_id = account.id
       LEFT JOIN notification_settings AS settings ON settings.user_id = account.id
       WHERE account.email_verified_at IS NOT NULL
         AND account.onboarding_completed_at IS NOT NULL
         AND COALESCE(settings.system_enabled, true)
         AND EXISTS (
           SELECT 1
           FROM competitions AS competition
           WHERE competition.lifecycle = 'registration_open'
             AND competition.published_at IS NOT NULL
             AND (competition.registration_closes_at IS NULL OR competition.registration_closes_at > $1)
         )
         AND (
           profile.user_id IS NULL
           OR NULLIF(BTRIM(profile.display_name), '') IS NULL
           OR NULLIF(BTRIM(profile.handle), '') IS NULL
           OR NULLIF(BTRIM(profile.location_label), '') IS NULL
           OR NOT EXISTS (
             SELECT 1 FROM player_game_identities AS identity WHERE identity.user_id = account.id
           )
           OR NOT EXISTS (
             SELECT 1 FROM player_availability AS availability WHERE availability.user_id = account.id
           )
         )
       ORDER BY account.created_at ASC
       LIMIT $2`,
      now,
      perRuleLimit,
    )),
  );

  return signals;
}

export async function upsertProactiveReminders(
  client: PoolClient,
  reminders: readonly ProactiveReminder[],
  now: Date,
): Promise<{ createdCount: number; updatedCount: number }> {
  if (reminders.length === 0) return { createdCount: 0, updatedCount: 0 };

  const payload = reminders.map((item) => ({
    user_id: item.userId,
    title: item.title,
    description: item.description,
    category: item.category,
    priority: item.priority,
    expires_at: item.expiresAt,
    href: item.href,
    action_label: item.actionLabel,
    reference: item.reference,
    source_type: item.sourceType,
    source_id: item.sourceId,
  }));

  const result = await client.query<UpsertCountRow>(
    `WITH payload AS (
       SELECT *
       FROM jsonb_to_recordset($1::jsonb) AS item(
         user_id uuid,
         title text,
         description text,
         category text,
         priority text,
         expires_at timestamptz,
         href text,
         action_label text,
         reference text,
         source_type text,
         source_id text
       )
     ), upserted AS (
       INSERT INTO notifications (
         user_id, title, description, category, state, priority, expires_at,
         href, action_label, source_label, reference, source_type, source_id,
         created_at, updated_at
       )
       SELECT
         user_id, title, description, category, 'unread', priority, expires_at,
         href, action_label, 'Proactive operations', reference, source_type, source_id,
         $2, $2
       FROM payload
       ON CONFLICT (user_id, reference) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         category = EXCLUDED.category,
         priority = EXCLUDED.priority,
         expires_at = EXCLUDED.expires_at,
         href = EXCLUDED.href,
         action_label = EXCLUDED.action_label,
         source_type = EXCLUDED.source_type,
         source_id = EXCLUDED.source_id,
         state = CASE
           WHEN notifications.state = 'read'
             AND notifications.priority <> 'critical'
             AND EXCLUDED.priority = 'critical'
           THEN 'unread'
           ELSE notifications.state
         END,
         read_at = CASE
           WHEN notifications.state = 'read'
             AND notifications.priority <> 'critical'
             AND EXCLUDED.priority = 'critical'
           THEN NULL
           ELSE notifications.read_at
         END,
         updated_at = $2
       WHERE notifications.state IN ('unread', 'read')
       RETURNING (xmax = 0) AS inserted
     )
     SELECT
       COUNT(*) FILTER (WHERE inserted)::text AS created_count,
       COUNT(*) FILTER (WHERE NOT inserted)::text AS updated_count
     FROM upserted`,
    [JSON.stringify(payload), now],
  );

  return {
    createdCount: Number(result.rows[0]?.created_count ?? 0),
    updatedCount: Number(result.rows[0]?.updated_count ?? 0),
  };
}

export async function resolveCompletedProactiveReminders(
  client: PoolClient,
  now: Date,
): Promise<number> {
  const result = await client.query<ResolveCountRow>(
    `WITH resolved AS (
       UPDATE notifications AS notification
          SET state = 'actioned',
              actioned_at = COALESCE(notification.actioned_at, $1),
              updated_at = $1
        WHERE notification.state IN ('unread', 'read')
          AND notification.source_type LIKE 'proactive_%'
          AND (
            (
              notification.source_type = 'proactive_match_check_in'
              AND NOT EXISTS (
                SELECT 1
                FROM match_participants AS participant
                INNER JOIN matches AS match ON match.id = participant.match_id
                WHERE participant.user_id = notification.user_id
                  AND match.id = notification.source_id
                  AND match.state = 'check-in-open'
                  AND participant.checked_in_at IS NULL
                  AND match.check_in_closes_at > $1
              )
            )
            OR (
              notification.source_type = 'proactive_match_lobby_ready'
              AND NOT EXISTS (
                SELECT 1
                FROM match_participants AS participant
                INNER JOIN matches AS match ON match.id = participant.match_id
                WHERE participant.user_id = notification.user_id
                  AND match.id = notification.source_id
                  AND match.state IN ('both-ready', 'lobby-open')
                  AND participant.lobby_entered_at IS NULL
                  AND match.result_due_at > $1
              )
            )
            OR (
              notification.source_type = 'proactive_match_result_confirmation'
              AND NOT EXISTS (
                SELECT 1
                FROM match_results AS result
                INNER JOIN matches AS match ON match.id = result.match_id
                INNER JOIN match_participants AS participant ON participant.match_id = match.id
                WHERE participant.user_id = notification.user_id
                  AND match.id = notification.source_id
                  AND result.status = 'pending'
                  AND result.confirmed_by IS NULL
                  AND participant.user_id <> result.submitted_by
                  AND match.result_due_at > $1
              )
            )
            OR (
              notification.source_type = 'proactive_competition_registration_closing'
              AND NOT EXISTS (
                SELECT 1
                FROM workflow_resume_checkpoints AS checkpoint
                INNER JOIN competitions AS competition ON competition.id = checkpoint.workflow_key
                WHERE checkpoint.user_id = notification.user_id
                  AND competition.id = notification.source_id
                  AND checkpoint.workflow_type = 'competition_entry'
                  AND checkpoint.expires_at > $1
                  AND competition.lifecycle = 'registration_open'
                  AND competition.registration_closes_at > $1
                  AND NOT EXISTS (
                    SELECT 1
                    FROM competition_entries AS entry
                    WHERE entry.user_id = checkpoint.user_id
                      AND entry.competition_id = competition.id
                      AND entry.state IN ('confirmed', 'waitlisted')
                  )
              )
            )
            OR (
              notification.source_type = 'proactive_crew_invite_expiring'
              AND NOT EXISTS (
                SELECT 1
                FROM crew_invites AS invite
                WHERE invite.id::text = notification.source_id
                  AND invite.user_id = notification.user_id
                  AND invite.status = 'pending'
                  AND invite.expires_at > $1
              )
            )
            OR (
              notification.source_type = 'proactive_reward_claimable'
              AND NOT EXISTS (
                SELECT 1
                FROM reward_grants AS grant
                WHERE grant.id::text = notification.source_id
                  AND grant.user_id = notification.user_id
                  AND grant.state = 'claimable'
                  AND (grant.expires_at IS NULL OR grant.expires_at > $1)
              )
            )
            OR (
              notification.source_type = 'proactive_profile_readiness'
              AND NOT EXISTS (
                SELECT 1
                FROM users AS account
                LEFT JOIN player_profiles AS profile ON profile.user_id = account.id
                WHERE account.id = notification.user_id
                  AND account.email_verified_at IS NOT NULL
                  AND account.onboarding_completed_at IS NOT NULL
                  AND (
                    profile.user_id IS NULL
                    OR NULLIF(BTRIM(profile.display_name), '') IS NULL
                    OR NULLIF(BTRIM(profile.handle), '') IS NULL
                    OR NULLIF(BTRIM(profile.location_label), '') IS NULL
                    OR NOT EXISTS (
                      SELECT 1 FROM player_game_identities AS identity WHERE identity.user_id = account.id
                    )
                    OR NOT EXISTS (
                      SELECT 1 FROM player_availability AS availability WHERE availability.user_id = account.id
                    )
                  )
              )
            )
          )
       RETURNING 1
     )
     SELECT COUNT(*)::text AS resolved_count FROM resolved`,
    [now],
  );

  return Number(result.rows[0]?.resolved_count ?? 0);
}
