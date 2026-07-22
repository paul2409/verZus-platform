CREATE TABLE auth_login_throttles (
  identifier_hash char(64) PRIMARY KEY,
  failure_count integer NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
  window_started_at timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX auth_login_throttles_blocked_idx
  ON auth_login_throttles (blocked_until)
  WHERE blocked_until IS NOT NULL;

CREATE INDEX auth_sessions_expiry_idx
  ON auth_sessions (expires_at)
  WHERE revoked_at IS NULL;
