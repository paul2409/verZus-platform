CREATE TABLE crew_operation_commands (
  actor_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  operation text NOT NULL,
  outcome text NOT NULL,
  event_id uuid NOT NULL REFERENCES crew_events(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (actor_user_id, idempotency_key)
);

CREATE INDEX crew_operation_commands_crew_idx
  ON crew_operation_commands (crew_id, created_at DESC);

CREATE INDEX crew_members_active_crew_idx
  ON crew_members (crew_id, joined_at ASC)
  WHERE left_at IS NULL;

CREATE INDEX crew_applications_pending_expiry_idx
  ON crew_applications (crew_id, expires_at ASC)
  WHERE status = 'pending';

CREATE INDEX crew_invites_pending_expiry_idx
  ON crew_invites (crew_id, expires_at ASC)
  WHERE status = 'pending';
