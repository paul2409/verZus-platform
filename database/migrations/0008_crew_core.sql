CREATE TABLE crews (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  normalized_name text NOT NULL UNIQUE,
  tag varchar(6) NOT NULL,
  normalized_tag varchar(6) NOT NULL UNIQUE,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  crest_src text NOT NULL,
  banner_src text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  tier text NOT NULL DEFAULT 'Unranked',
  primary_game text NOT NULL,
  region text NOT NULL,
  visibility text NOT NULL CHECK (visibility IN ('public', 'private')),
  recruiting boolean NOT NULL DEFAULT true,
  language text NOT NULL DEFAULT 'English',
  minimum_rank text NOT NULL DEFAULT 'Open',
  community_link_label text NOT NULL DEFAULT 'Not configured',
  lifecycle text NOT NULL DEFAULT 'forming'
    CHECK (lifecycle IN ('forming', 'active', 'inactive', 'suspended', 'disbanded', 'archived')),
  capacity integer NOT NULL DEFAULT 25 CHECK (capacity BETWEEN 1 AND 100),
  owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  disbanded_at timestamptz
);

CREATE INDEX crews_discovery_idx
  ON crews (visibility, lifecycle, recruiting, created_at DESC);

CREATE TABLE crew_members (
  crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'captain', 'manager', 'member', 'trial')),
  contribution integer NOT NULL DEFAULT 0 CHECK (contribution >= 0),
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  PRIMARY KEY (crew_id, user_id)
);

CREATE UNIQUE INDEX crew_members_one_active_crew_per_user_idx
  ON crew_members (user_id)
  WHERE left_at IS NULL;

CREATE TABLE crew_competitive_summaries (
  crew_id uuid PRIMARY KEY REFERENCES crews(id) ON DELETE CASCADE,
  rank integer NOT NULL DEFAULT 0 CHECK (rank >= 0),
  previous_rank integer NOT NULL DEFAULT 0 CHECK (previous_rank >= 0),
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  wins integer NOT NULL DEFAULT 0 CHECK (wins >= 0),
  losses integer NOT NULL DEFAULT 0 CHECK (losses >= 0),
  streak integer NOT NULL DEFAULT 0 CHECK (streak >= 0),
  trust integer NOT NULL DEFAULT 0 CHECK (trust BETWEEN 0 AND 100),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE crew_applications (
  id uuid PRIMARY KEY,
  crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game text NOT NULL,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn', 'expired')),
  expires_at timestamptz NOT NULL,
  decided_at timestamptz,
  decided_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX crew_applications_one_pending_idx
  ON crew_applications (crew_id, user_id)
  WHERE status = 'pending';

CREATE TABLE crew_invites (
  id uuid PRIMARY KEY,
  crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('captain', 'manager', 'member', 'trial')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz NOT NULL,
  invited_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX crew_invites_one_pending_idx
  ON crew_invites (crew_id, user_id)
  WHERE status = 'pending';

CREATE TABLE crew_events (
  id uuid PRIMARY KEY,
  crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  title text NOT NULL,
  game text NOT NULL,
  score_label text,
  tone text NOT NULL DEFAULT 'neutral' CHECK (tone IN ('win', 'loss', 'neutral')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX crew_events_feed_idx ON crew_events (crew_id, created_at DESC);

CREATE TABLE crew_achievements (
  id uuid PRIMARY KEY,
  crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  unlocked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE crew_creation_commands (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  crew_id uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, idempotency_key)
);
