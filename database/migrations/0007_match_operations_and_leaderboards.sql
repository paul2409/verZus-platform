CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE matches (
  id text PRIMARY KEY,
  competition_id text REFERENCES competitions(id) ON DELETE SET NULL,
  game_id text NOT NULL REFERENCES games(id) ON DELETE RESTRICT,
  state text NOT NULL DEFAULT 'scheduled'
    CHECK (state IN (
      'scheduled',
      'check-in-unavailable',
      'check-in-open',
      'checked-in',
      'opponent-not-checked-in',
      'both-ready',
      'lobby-open',
      'in-progress',
      'submit-result',
      'awaiting-opponent-confirmation',
      'result-confirmed',
      'disputed',
      'forfeit',
      'cancelled',
      'completed'
    )),
  round_label text NOT NULL DEFAULT 'MATCH',
  format_label text NOT NULL DEFAULT '1V1',
  scheduled_at timestamptz NOT NULL,
  check_in_opens_at timestamptz NOT NULL,
  check_in_closes_at timestamptz NOT NULL,
  lobby_opens_at timestamptz NOT NULL,
  match_starts_at timestamptz NOT NULL,
  result_due_at timestamptz NOT NULL,
  lobby_code text NOT NULL,
  platform text NOT NULL DEFAULT 'EA SPORTS FC',
  server_region text NOT NULL DEFAULT 'AUTO',
  join_method text NOT NULL DEFAULT 'Use the server-issued lobby code.',
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  terminal_reason text,
  terminal_at timestamptz,
  terminal_actor_role text
    CHECK (terminal_actor_role IS NULL OR terminal_actor_role IN ('current_user', 'support', 'admin', 'system')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (check_in_opens_at <= check_in_closes_at),
  CHECK (check_in_closes_at <= match_starts_at),
  CHECK (lobby_opens_at <= match_starts_at),
  CHECK (match_starts_at <= result_due_at)
);

CREATE INDEX matches_schedule_idx ON matches (scheduled_at, state);
CREATE INDEX matches_competition_idx ON matches (competition_id, scheduled_at);

CREATE TABLE match_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  side text NOT NULL CHECK (side IN ('home', 'away')),
  rank_label text NOT NULL DEFAULT 'UNRANKED',
  checked_in_at timestamptz,
  lobby_entered_at timestamptz,
  ready_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, user_id),
  UNIQUE (match_id, side)
);

CREATE INDEX match_participants_user_idx ON match_participants (user_id, match_id);

CREATE TABLE match_operation_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  actor_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  operation text NOT NULL,
  idempotency_key text NOT NULL,
  status_code integer NOT NULL CHECK (status_code BETWEEN 100 AND 599),
  response_body jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (actor_user_id, idempotency_key)
);

CREATE INDEX match_operation_commands_match_idx
  ON match_operation_commands (match_id, created_at DESC);

CREATE TABLE match_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  match_version integer NOT NULL CHECK (match_version > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX match_events_match_idx ON match_events (match_id, created_at ASC);

CREATE TABLE match_lobby_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  reported_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('connection', 'opponent', 'rules', 'other')),
  summary text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX match_lobby_issues_match_idx
  ON match_lobby_issues (match_id, created_at DESC);

CREATE TABLE match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  home_score integer NOT NULL CHECK (home_score BETWEEN 0 AND 99),
  away_score integer NOT NULL CHECK (away_score BETWEEN 0 AND 99),
  note text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'conflict', 'disputed', 'void')),
  confirmed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  confirmation_home_score integer CHECK (confirmation_home_score BETWEEN 0 AND 99),
  confirmation_away_score integer CHECK (confirmation_away_score BETWEEN 0 AND 99),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX match_results_status_idx ON match_results (status, confirmed_at DESC);

CREATE TABLE match_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  mime_type text NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg', 'video/mp4')),
  size_bytes integer NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 26214400),
  sha256 char(64) NOT NULL,
  storage_key text NOT NULL,
  scan_status text NOT NULL DEFAULT 'pending'
    CHECK (scan_status IN ('pending', 'clean', 'rejected')),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, uploaded_by, sha256)
);

CREATE INDEX match_evidence_match_idx ON match_evidence (match_id, uploaded_at ASC);

CREATE TABLE match_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason text NOT NULL
    CHECK (reason IN ('score_mismatch', 'opponent_no_show', 'rule_violation', 'connection_failure', 'other')),
  summary text NOT NULL,
  claimed_home_score integer CHECK (claimed_home_score BETWEEN 0 AND 99),
  claimed_away_score integer CHECK (claimed_away_score BETWEEN 0 AND 99),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'rejected')),
  audit_event_id uuid NOT NULL REFERENCES audit_events(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX match_disputes_queue_idx ON match_disputes (status, created_at ASC);

CREATE TABLE leaderboard_revisions (
  mode text PRIMARY KEY CHECK (mode IN ('weekly', 'pools', 'game', 'crew', 'combine')),
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO leaderboard_revisions (mode)
VALUES ('weekly'), ('pools'), ('game'), ('crew'), ('combine')
ON CONFLICT (mode) DO NOTHING;
