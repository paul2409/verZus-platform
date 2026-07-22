CREATE TABLE games (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_name text NOT NULL,
  filter_value text NOT NULL UNIQUE
    CHECK (filter_value IN ('ea-fc', 'cod-mobile', 'clash-royale', 'league-of-legends')),
  art_key text NOT NULL
    CHECK (art_key IN ('championship', 'ea-fc', 'cod-mobile', 'clash-royale', 'league-of-legends')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO games (id, slug, name, short_name, filter_value, art_key)
VALUES ('ea-sports-fc', 'ea-sports-fc', 'EA Sports FC', 'EAFC', 'ea-fc', 'ea-fc')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  filter_value = EXCLUDED.filter_value,
  art_key = EXCLUDED.art_key,
  active = true,
  updated_at = now();

CREATE TABLE competitions (
  id text PRIMARY KEY,
  game_id text NOT NULL REFERENCES games(id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text NOT NULL,
  eyebrow text NOT NULL DEFAULT 'OPEN COMPETITION',
  lifecycle text NOT NULL DEFAULT 'draft'
    CHECK (lifecycle IN (
      'draft',
      'scheduled',
      'registration_open',
      'registration_closed',
      'check_in_open',
      'in_progress',
      'completed',
      'cancelled',
      'archived'
    )),
  format_label text NOT NULL,
  region_code text,
  region_label text NOT NULL DEFAULT 'GLOBAL',
  team_size text NOT NULL CHECK (team_size IN ('1V1', '4V4', '5V5')),
  capacity integer NOT NULL CHECK (capacity > 0),
  entry_fee_amount integer NOT NULL DEFAULT 0 CHECK (entry_fee_amount >= 0),
  entry_fee_currency text NOT NULL DEFAULT 'NGN',
  prize_value numeric(14, 2) NOT NULL DEFAULT 0 CHECK (prize_value >= 0),
  prize_currency text NOT NULL DEFAULT 'NGN',
  reward_note text NOT NULL DEFAULT 'Rewards will be published by competition operations.',
  reward_breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  rules_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  season_label text NOT NULL DEFAULT 'CURRENT SEASON',
  week_label text NOT NULL DEFAULT 'CURRENT WEEK',
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  check_in_opens_at timestamptz,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  waitlist_enabled boolean NOT NULL DEFAULT false,
  minimum_trust_score numeric(5, 2) NOT NULL DEFAULT 0
    CHECK (minimum_trust_score >= 0 AND minimum_trust_score <= 100),
  is_featured boolean NOT NULL DEFAULT false,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (registration_closes_at IS NULL OR registration_opens_at IS NULL OR registration_closes_at > registration_opens_at),
  CHECK (check_in_opens_at IS NULL OR check_in_opens_at <= starts_at),
  CHECK (ends_at IS NULL OR ends_at > starts_at),
  CHECK (jsonb_typeof(reward_breakdown) = 'array'),
  CHECK (jsonb_typeof(rules_sections) = 'array'),
  CHECK (jsonb_typeof(tags) = 'array')
);

CREATE INDEX competitions_discovery_idx
  ON competitions (published_at, lifecycle, starts_at)
  WHERE published_at IS NOT NULL AND lifecycle <> 'archived';

CREATE INDEX competitions_featured_idx
  ON competitions (is_featured, starts_at)
  WHERE published_at IS NOT NULL AND lifecycle <> 'archived';

CREATE TABLE competition_entries (
  id uuid PRIMARY KEY,
  competition_id text NOT NULL REFERENCES competitions(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'confirmed'
    CHECK (state IN ('confirmed', 'waitlisted', 'withdrawn', 'cancelled')),
  idempotency_key uuid NOT NULL,
  competition_version integer NOT NULL CHECK (competition_version > 0),
  registration_code text NOT NULL UNIQUE,
  registered_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, user_id),
  UNIQUE (user_id, idempotency_key)
);

CREATE INDEX competition_entries_competition_idx
  ON competition_entries (competition_id, state, registered_at);

CREATE INDEX competition_entries_user_idx
  ON competition_entries (user_id, registered_at DESC);
