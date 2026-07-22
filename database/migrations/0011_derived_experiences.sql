CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('match', 'crew', 'competition', 'reward', 'security', 'system')),
  state text NOT NULL DEFAULT 'unread'
    CHECK (state IN ('unread', 'read', 'actioned', 'dismissed', 'expired')),
  priority text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('critical', 'high', 'normal', 'low')),
  expires_at timestamptz,
  href text,
  action_label text,
  source_label text NOT NULL,
  reference text NOT NULL,
  source_type text,
  source_id text,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  read_at timestamptz,
  actioned_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, reference)
);

CREATE INDEX IF NOT EXISTS notifications_user_feed_idx
  ON notifications (user_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON notifications (user_id, created_at DESC)
  WHERE state = 'unread';

CREATE TABLE IF NOT EXISTS notification_commands (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  fingerprint char(64) NOT NULL,
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS notification_settings (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  email_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT false,
  match_enabled boolean NOT NULL DEFAULT true,
  crew_enabled boolean NOT NULL DEFAULT true,
  competition_enabled boolean NOT NULL DEFAULT true,
  reward_enabled boolean NOT NULL DEFAULT true,
  system_enabled boolean NOT NULL DEFAULT true,
  quiet_hours_enabled boolean NOT NULL DEFAULT false,
  quiet_hours_start_minute integer NOT NULL DEFAULT 1320
    CHECK (quiet_hours_start_minute BETWEEN 0 AND 1439),
  quiet_hours_end_minute integer NOT NULL DEFAULT 420
    CHECK (quiet_hours_end_minute BETWEEN 0 AND 1439),
  quiet_hours_timezone text NOT NULL DEFAULT 'UTC',
  email_digest text NOT NULL DEFAULT 'daily'
    CHECK (email_digest IN ('immediate', 'daily', 'weekly')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_settings_commands (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  fingerprint char(64) NOT NULL,
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS search_query_history (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  normalized_query text NOT NULL,
  query text NOT NULL,
  domain text NOT NULL CHECK (domain IN ('all', 'players', 'crews', 'competitions', 'matches')),
  usage_count integer NOT NULL DEFAULT 1 CHECK (usage_count > 0),
  last_searched_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, normalized_query, domain)
);

CREATE INDEX IF NOT EXISTS search_query_history_recent_idx
  ON search_query_history (user_id, last_searched_at DESC);

CREATE INDEX IF NOT EXISTS search_query_history_trending_idx
  ON search_query_history (last_searched_at DESC, usage_count DESC);

CREATE OR REPLACE FUNCTION verzus_insert_notification(
  target_user_id uuid,
  notification_title text,
  notification_description text,
  notification_category text,
  notification_priority text,
  notification_href text,
  notification_action_label text,
  notification_source_label text,
  notification_reference text,
  notification_source_type text,
  notification_source_id text,
  notification_expires_at timestamptz DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    title,
    description,
    category,
    priority,
    href,
    action_label,
    source_label,
    reference,
    source_type,
    source_id,
    expires_at
  ) VALUES (
    target_user_id,
    notification_title,
    notification_description,
    notification_category,
    notification_priority,
    notification_href,
    notification_action_label,
    notification_source_label,
    notification_reference,
    notification_source_type,
    notification_source_id,
    notification_expires_at
  )
  ON CONFLICT (user_id, reference) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION verzus_notify_crew_invite()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  crew_name text;
BEGIN
  IF NEW.status <> 'pending' THEN
    RETURN NEW;
  END IF;

  SELECT name INTO crew_name FROM crews WHERE id = NEW.crew_id;

  PERFORM verzus_insert_notification(
    NEW.user_id,
    'Crew invitation received',
    COALESCE(crew_name, 'A Crew') || ' invited you to join its competitive roster.',
    'crew',
    'high',
    '/crews/' || NEW.crew_id::text,
    'Review invitation',
    'Crew membership',
    'crew-invite:' || NEW.id::text,
    'crew_invite',
    NEW.id::text,
    NEW.expires_at
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS crew_invites_notification_trigger ON crew_invites;
CREATE TRIGGER crew_invites_notification_trigger
AFTER INSERT ON crew_invites
FOR EACH ROW EXECUTE FUNCTION verzus_notify_crew_invite();

CREATE OR REPLACE FUNCTION verzus_notify_competition_entry()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  competition_name text;
BEGIN
  SELECT name INTO competition_name FROM competitions WHERE id = NEW.competition_id;

  PERFORM verzus_insert_notification(
    NEW.user_id,
    CASE WHEN NEW.state = 'waitlisted' THEN 'Competition waitlist confirmed' ELSE 'Competition entry confirmed' END,
    'Your entry for ' || COALESCE(competition_name, NEW.competition_id) || ' is ' || NEW.state || '.',
    'competition',
    'normal',
    '/compete/' || NEW.competition_id,
    'View competition',
    'Competition operations',
    'competition-entry:' || NEW.id::text,
    'competition_entry',
    NEW.id::text,
    NULL
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS competition_entries_notification_trigger ON competition_entries;
CREATE TRIGGER competition_entries_notification_trigger
AFTER INSERT ON competition_entries
FOR EACH ROW EXECUTE FUNCTION verzus_notify_competition_entry();

CREATE OR REPLACE FUNCTION verzus_notify_reward_grant()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  reward_title text;
BEGIN
  IF NEW.state NOT IN ('claimable', 'expired', 'revoked') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.state = NEW.state THEN
      RETURN NEW;
    END IF;
  END IF;

  SELECT title INTO reward_title FROM reward_definitions WHERE id = NEW.reward_id;

  PERFORM verzus_insert_notification(
    NEW.user_id,
    CASE
      WHEN NEW.state = 'claimable' THEN 'Reward ready to claim'
      WHEN NEW.state = 'expired' THEN 'Reward expired'
      ELSE 'Reward revoked'
    END,
    COALESCE(reward_title, NEW.reward_id) || ' is now ' || NEW.state || '.',
    'reward',
    CASE WHEN NEW.state = 'claimable' THEN 'normal' ELSE 'low' END,
    '/rewards',
    'Open rewards',
    'Rewards service',
    'reward-grant:' || NEW.id::text || ':' || NEW.state,
    'reward_grant',
    NEW.id::text,
    NEW.expires_at
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reward_grants_notification_trigger ON reward_grants;
CREATE TRIGGER reward_grants_notification_trigger
AFTER INSERT OR UPDATE OF state ON reward_grants
FOR EACH ROW EXECUTE FUNCTION verzus_notify_reward_grant();

CREATE OR REPLACE FUNCTION verzus_notify_match_check_in()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  participant record;
BEGIN
  IF NEW.state <> 'check-in-open' OR OLD.state = NEW.state THEN
    RETURN NEW;
  END IF;

  FOR participant IN
    SELECT user_id FROM match_participants WHERE match_id = NEW.id
  LOOP
    PERFORM verzus_insert_notification(
      participant.user_id,
      'Match check-in is open',
      'Check in before the server-controlled deadline for match ' || NEW.id || '.',
      'match',
      'critical',
      '/matches/' || NEW.id || '/check-in',
      'Open check-in',
      'Match operations',
      'match-check-in:' || NEW.id,
      'match',
      NEW.id,
      NEW.check_in_closes_at
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS matches_check_in_notification_trigger ON matches;
CREATE TRIGGER matches_check_in_notification_trigger
AFTER UPDATE OF state ON matches
FOR EACH ROW EXECUTE FUNCTION verzus_notify_match_check_in();

CREATE OR REPLACE FUNCTION verzus_notify_match_result()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  participant record;
BEGIN
  IF NEW.status <> 'confirmed' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = NEW.status THEN
      RETURN NEW;
    END IF;
  END IF;

  FOR participant IN
    SELECT user_id FROM match_participants WHERE match_id = NEW.match_id
  LOOP
    PERFORM verzus_insert_notification(
      participant.user_id,
      'Match result confirmed',
      'The final score is ' || NEW.home_score::text || '-' || NEW.away_score::text || '.',
      'match',
      'normal',
      '/matches/' || NEW.match_id,
      'View result',
      'Match operations',
      'match-result:' || NEW.id::text,
      'match_result',
      NEW.id::text,
      NULL
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS match_results_notification_trigger ON match_results;
CREATE TRIGGER match_results_notification_trigger
AFTER INSERT OR UPDATE OF status ON match_results
FOR EACH ROW EXECUTE FUNCTION verzus_notify_match_result();

INSERT INTO notification_settings (user_id, quiet_hours_timezone)
SELECT user_account.id, COALESCE(NULLIF(player_profile.timezone, ''), 'UTC')
FROM users AS user_account
LEFT JOIN player_profiles AS player_profile ON player_profile.user_id = user_account.id
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO notifications (
  user_id,
  title,
  description,
  category,
  priority,
  expires_at,
  href,
  action_label,
  source_label,
  reference,
  source_type,
  source_id,
  created_at
)
SELECT
  crew_invite.user_id,
  'Crew invitation received',
  crew.name || ' invited you to join its competitive roster.',
  'crew',
  'high',
  crew_invite.expires_at,
  '/crews/' || crew_invite.crew_id::text,
  'Review invitation',
  'Crew membership',
  'crew-invite:' || crew_invite.id::text,
  'crew_invite',
  crew_invite.id::text,
  crew_invite.created_at
FROM crew_invites AS crew_invite
JOIN crews AS crew ON crew.id = crew_invite.crew_id
WHERE crew_invite.status = 'pending'
ON CONFLICT (user_id, reference) DO NOTHING;

INSERT INTO notifications (
  user_id,
  title,
  description,
  category,
  priority,
  expires_at,
  href,
  action_label,
  source_label,
  reference,
  source_type,
  source_id,
  created_at
)
SELECT
  reward_grant.user_id,
  'Reward ready to claim',
  reward_definition.title || ' is ready to claim.',
  'reward',
  'normal',
  reward_grant.expires_at,
  '/rewards',
  'Open rewards',
  'Rewards service',
  'reward-grant:' || reward_grant.id::text || ':claimable',
  'reward_grant',
  reward_grant.id::text,
  reward_grant.updated_at
FROM reward_grants AS reward_grant
JOIN reward_definitions AS reward_definition ON reward_definition.id = reward_grant.reward_id
WHERE reward_grant.state = 'claimable'
ON CONFLICT (user_id, reference) DO NOTHING;
