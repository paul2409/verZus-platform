CREATE TABLE user_smart_preferences (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  competition_game text
    CHECK (competition_game IN ('all', 'ea-fc', 'cod-mobile', 'clash-royale', 'league-of-legends')),
  competition_sort text
    CHECK (competition_sort IN ('starts-soon', 'popular', 'prize-high', 'availability')),
  leaderboard_mode text
    CHECK (leaderboard_mode IN ('weekly', 'pools', 'game', 'crew', 'combine')),
  leaderboard_game text
    CHECK (leaderboard_game IN ('all', 'ea-fc', 'cod-mobile', 'clash-royale', 'league')),
  search_domain text
    CHECK (search_domain IN ('all', 'players', 'crews', 'competitions', 'matches')),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX user_smart_preferences_updated_idx
  ON user_smart_preferences (updated_at DESC);
