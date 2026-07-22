CREATE TABLE IF NOT EXISTS reward_definitions (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  kind text NOT NULL CHECK (kind IN ('coins', 'xp', 'crate', 'cosmetic', 'boost')),
  amount_label text NOT NULL,
  artwork_src text NOT NULL,
  artwork_alt text NOT NULL,
  source_label text NOT NULL,
  requirement_label text NOT NULL,
  state_detail text NOT NULL,
  level_required integer CHECK (level_required IS NULL OR level_required >= 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reward_seasons (
  id text PRIMARY KEY,
  label text NOT NULL,
  chapter_label text NOT NULL,
  state text NOT NULL CHECK (state IN ('upcoming', 'active', 'completed', 'ended')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  total_tiers integer NOT NULL CHECK (total_tiers > 0),
  target_season_xp integer NOT NULL CHECK (target_season_xp > 0),
  weekly_xp_cap integer NOT NULL CHECK (weekly_xp_cap > 0),
  boost_multiplier numeric(8, 3) NOT NULL DEFAULT 1 CHECK (boost_multiplier > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS reward_seasons_one_active_idx
  ON reward_seasons ((state))
  WHERE state = 'active';

CREATE TABLE IF NOT EXISTS reward_season_objectives (
  id text PRIMARY KEY,
  season_id text NOT NULL REFERENCES reward_seasons(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  progress_target integer NOT NULL CHECK (progress_target > 0),
  xp_reward integer NOT NULL DEFAULT 0 CHECK (xp_reward >= 0),
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reward_season_objectives_season_idx
  ON reward_season_objectives (season_id, sort_order, id);

CREATE TABLE IF NOT EXISTS reward_season_milestones (
  id text PRIMARY KEY,
  season_id text NOT NULL REFERENCES reward_seasons(id) ON DELETE CASCADE,
  tier integer NOT NULL CHECK (tier >= 0),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  requirement_label text NOT NULL,
  reward_id text REFERENCES reward_definitions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (season_id, tier)
);

CREATE TABLE IF NOT EXISTS player_reward_progress (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_level integer NOT NULL DEFAULT 0 CHECK (current_level >= 0),
  current_xp integer NOT NULL DEFAULT 0 CHECK (current_xp >= 0),
  target_xp integer NOT NULL DEFAULT 1000 CHECK (target_xp > 0),
  lifetime_xp bigint NOT NULL DEFAULT 0 CHECK (lifetime_xp >= 0),
  inventory_version bigint NOT NULL DEFAULT 1 CHECK (inventory_version > 0),
  season_id text REFERENCES reward_seasons(id) ON DELETE SET NULL,
  current_season_xp integer NOT NULL DEFAULT 0 CHECK (current_season_xp >= 0),
  weekly_xp_earned integer NOT NULL DEFAULT 0 CHECK (weekly_xp_earned >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS player_reward_objective_progress (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  objective_id text NOT NULL REFERENCES reward_season_objectives(id) ON DELETE CASCADE,
  progress_current integer NOT NULL DEFAULT 0 CHECK (progress_current >= 0),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, objective_id)
);

CREATE TABLE IF NOT EXISTS reward_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id text NOT NULL REFERENCES reward_definitions(id) ON DELETE RESTRICT,
  state text NOT NULL CHECK (state IN ('locked', 'eligible', 'claimable', 'claiming', 'claimed', 'expired', 'revoked')),
  eligible_at timestamptz,
  claimable_at timestamptz,
  expires_at timestamptz,
  claimed_at timestamptz,
  revoked_at timestamptz,
  revoked_reason text,
  claim_reference text UNIQUE,
  source_reference text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reward_grants_user_state_idx
  ON reward_grants (user_id, state, created_at DESC);

CREATE TABLE IF NOT EXISTS reward_claim_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  fingerprint text NOT NULL,
  request_id text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS reward_history_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grant_id uuid REFERENCES reward_grants(id) ON DELETE SET NULL,
  reward_id text NOT NULL,
  title text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('coins', 'xp', 'crate', 'cosmetic', 'boost')),
  action text NOT NULL CHECK (action IN ('reward_issued', 'reward_claimed', 'reward_expired', 'reward_revoked')),
  amount_label text NOT NULL,
  source_label text NOT NULL,
  actor_label text NOT NULL,
  event_reference text NOT NULL UNIQUE,
  claim_reference text,
  reason text,
  inventory_version bigint,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reward_history_events_user_idx
  ON reward_history_events (user_id, occurred_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS reward_achievement_definitions (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category_label text NOT NULL CHECK (category_label IN ('competitive', 'crew', 'trust', 'season')),
  rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  requirement_label text NOT NULL,
  progress_target integer NOT NULL CHECK (progress_target > 0),
  reward_id text REFERENCES reward_definitions(id) ON DELETE SET NULL,
  artwork_src text NOT NULL,
  artwork_alt text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS player_achievements (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL REFERENCES reward_achievement_definitions(id) ON DELETE CASCADE,
  progress_current integer NOT NULL DEFAULT 0 CHECK (progress_current >= 0),
  unlocked_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS reward_achievement_provenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL REFERENCES reward_achievement_definitions(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('match', 'competition', 'crew', 'season')),
  source_id text NOT NULL,
  source_label text NOT NULL,
  verified_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reward_achievement_provenance_lookup_idx
  ON reward_achievement_provenance (user_id, achievement_id, verified_at DESC);
