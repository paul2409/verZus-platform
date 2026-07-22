CREATE TABLE auth_action_throttles (
  action text NOT NULL,
  key_hash char(64) NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  window_started_at timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (action, key_hash)
);

CREATE TABLE player_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  country_code char(2),
  region text,
  city text,
  timezone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE player_game_identities (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('playstation', 'xbox', 'pc', 'mobile', 'nintendo')),
  platform_handle text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, game_id, platform)
);

CREATE INDEX player_game_identities_user_idx ON player_game_identities (user_id);

CREATE TABLE player_availability (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week text NOT NULL CHECK (
    day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
  ),
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

CREATE INDEX player_availability_user_idx ON player_availability (user_id);

CREATE TABLE onboarding_progress (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  draft jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('not_started', 'in_progress', 'ready_to_complete', 'completed')),
  current_step text NOT NULL CHECK (
    current_step IN ('welcome', 'games', 'location', 'identity', 'availability', 'crew', 'complete')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX onboarding_progress_status_idx ON onboarding_progress (status, updated_at DESC);
