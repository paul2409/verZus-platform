CREATE TABLE workflow_resume_checkpoints (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workflow_type text NOT NULL
    CHECK (workflow_type IN ('crew_creation', 'competition_entry', 'match_result')),
  workflow_key text NOT NULL,
  current_step text NOT NULL,
  resume_path text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  draft_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, workflow_type, workflow_key),
  CONSTRAINT workflow_resume_key_length CHECK (char_length(workflow_key) BETWEEN 1 AND 120),
  CONSTRAINT workflow_resume_step_length CHECK (char_length(current_step) BETWEEN 1 AND 40),
  CONSTRAINT workflow_resume_path_internal CHECK (resume_path LIKE '/%'),
  CONSTRAINT workflow_resume_payload_size CHECK (octet_length(draft_payload::text) <= 16384)
);

CREATE INDEX workflow_resume_active_user_idx
  ON workflow_resume_checkpoints (user_id, expires_at, updated_at DESC);
