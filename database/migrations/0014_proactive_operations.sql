CREATE TABLE proactive_operation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id text NOT NULL UNIQUE,
  trigger_source text NOT NULL
    CHECK (trigger_source IN ('api', 'cli', 'scheduler')),
  status text NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'completed', 'skipped', 'failed', 'disabled')),
  release_sha text NOT NULL DEFAULT 'local',
  candidate_count integer NOT NULL DEFAULT 0 CHECK (candidate_count >= 0),
  reminder_count integer NOT NULL DEFAULT 0 CHECK (reminder_count >= 0),
  created_count integer NOT NULL DEFAULT 0 CHECK (created_count >= 0),
  updated_count integer NOT NULL DEFAULT 0 CHECK (updated_count >= 0),
  resolved_count integer NOT NULL DEFAULT 0 CHECK (resolved_count >= 0),
  error_code text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX proactive_operation_runs_recent_idx
  ON proactive_operation_runs (started_at DESC, id DESC);

CREATE INDEX proactive_operation_runs_status_idx
  ON proactive_operation_runs (status, started_at DESC);
