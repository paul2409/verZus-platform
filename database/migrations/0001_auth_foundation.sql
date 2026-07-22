CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  normalized_email text NOT NULL UNIQUE,
  phone text,
  normalized_phone text UNIQUE,
  gamer_tag text NOT NULL,
  normalized_gamer_tag text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'player'
    CHECK (role IN ('player', 'captain', 'creator', 'referee', 'admin', 'superadmin')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'banned')),
  restriction_reason text,
  email_verified_at timestamptz,
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_restriction_reason_required CHECK (
    (status = 'active' AND restriction_reason IS NULL)
    OR (status IN ('suspended', 'banned') AND restriction_reason IS NOT NULL)
  )
);

CREATE TABLE auth_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  device_id text,
  expires_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX auth_sessions_user_active_idx
  ON auth_sessions (user_id, expires_at)
  WHERE revoked_at IS NULL;

CREATE TABLE email_verification_tokens (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash char(64) NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX email_verification_tokens_active_idx
  ON email_verification_tokens (user_id, expires_at DESC)
  WHERE consumed_at IS NULL;

CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX password_reset_tokens_active_idx
  ON password_reset_tokens (user_id, expires_at DESC)
  WHERE consumed_at IS NULL;

CREATE TABLE audit_events (
  id uuid PRIMARY KEY,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  reason text,
  request_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_events_target_idx
  ON audit_events (target_type, target_id, created_at DESC);

CREATE INDEX audit_events_actor_idx
  ON audit_events (actor_user_id, created_at DESC)
  WHERE actor_user_id IS NOT NULL;
