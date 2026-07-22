ALTER TABLE player_profiles
  ADD COLUMN location_label text NOT NULL DEFAULT '',
  ADD COLUMN availability_state text NOT NULL DEFAULT 'unavailable'
    CHECK (availability_state IN ('available', 'limited', 'unavailable')),
  ADD COLUMN availability_label text NOT NULL DEFAULT 'Not available',
  ADD COLUMN availability_detail text NOT NULL DEFAULT '',
  ADD COLUMN next_window_label text NOT NULL DEFAULT '';

UPDATE player_profiles
SET location_label = CONCAT_WS(', ', NULLIF(city, ''), NULLIF(region, ''), NULLIF(country_code, ''))
WHERE location_label = '';

CREATE TABLE profile_privacy_settings (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  profile_visibility text NOT NULL DEFAULT 'public'
    CHECK (profile_visibility IN ('public', 'friends', 'private')),
  location_audience text NOT NULL DEFAULT 'public'
    CHECK (location_audience IN ('public', 'friends', 'private')),
  crew_audience text NOT NULL DEFAULT 'public'
    CHECK (crew_audience IN ('public', 'friends', 'private')),
  statistics_audience text NOT NULL DEFAULT 'public'
    CHECK (statistics_audience IN ('public', 'friends', 'private')),
  trust_score_audience text NOT NULL DEFAULT 'public'
    CHECK (trust_score_audience IN ('public', 'friends', 'private')),
  match_history_audience text NOT NULL DEFAULT 'public'
    CHECK (match_history_audience IN ('public', 'friends', 'private')),
  game_handles_audience text NOT NULL DEFAULT 'friends'
    CHECK (game_handles_audience IN ('public', 'friends', 'private')),
  achievements_audience text NOT NULL DEFAULT 'public'
    CHECK (achievements_audience IN ('public', 'friends', 'private')),
  availability_audience text NOT NULL DEFAULT 'friends'
    CHECK (availability_audience IN ('public', 'friends', 'private')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO profile_privacy_settings (user_id, profile_visibility)
SELECT user_id, profile_visibility FROM player_profiles
ON CONFLICT (user_id) DO NOTHING;

CREATE TABLE profile_mutation_requests (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  operation text NOT NULL CHECK (operation IN ('profile_edit', 'profile_privacy')),
  idempotency_key text NOT NULL,
  fingerprint char(64) NOT NULL,
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, operation, idempotency_key)
);

CREATE INDEX profile_mutation_requests_created_idx
  ON profile_mutation_requests (created_at);
