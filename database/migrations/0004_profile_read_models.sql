ALTER TABLE player_profiles
  ADD COLUMN handle text,
  ADD COLUMN title text NOT NULL DEFAULT '',
  ADD COLUMN bio text NOT NULL DEFAULT '',
  ADD COLUMN avatar_url text,
  ADD COLUMN banner_url text,
  ADD COLUMN profile_visibility text NOT NULL DEFAULT 'public'
    CHECK (profile_visibility IN ('public', 'friends', 'private')),
  ADD COLUMN version integer NOT NULL DEFAULT 1 CHECK (version > 0);

UPDATE player_profiles AS profile
SET handle = '@' || LEFT(user_account.normalized_gamer_tag, 20)
FROM users AS user_account
WHERE user_account.id = profile.user_id
  AND profile.handle IS NULL;

ALTER TABLE player_profiles
  ALTER COLUMN handle SET NOT NULL;

CREATE UNIQUE INDEX player_profiles_handle_unique_idx
  ON player_profiles (LOWER(handle));

CREATE TABLE player_competitive_summaries (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  matches integer NOT NULL DEFAULT 0 CHECK (matches >= 0),
  wins integer NOT NULL DEFAULT 0 CHECK (wins >= 0),
  losses integer NOT NULL DEFAULT 0 CHECK (losses >= 0),
  draws integer NOT NULL DEFAULT 0 CHECK (draws >= 0),
  rating integer NOT NULL DEFAULT 0 CHECK (rating >= 0),
  weekly_rank integer NOT NULL DEFAULT 0 CHECK (weekly_rank >= 0),
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  trust_score numeric(5,2) NOT NULL DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  current_streak integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO player_competitive_summaries (user_id)
SELECT user_id FROM player_profiles
ON CONFLICT (user_id) DO NOTHING;
