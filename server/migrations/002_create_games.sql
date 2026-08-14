CREATE TABLE games (
  -- Issued when a game starts and signed into its session token. No default:
  -- using the token nonce as the primary key also makes finish retries idempotent.
  id         uuid        PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  score      integer     NOT NULL,
  started_at timestamptz NOT NULL,
  ended_at   timestamptz NOT NULL,
  mode       text        NOT NULL DEFAULT 'classic',

  CONSTRAINT games_mode_valid CHECK (mode IN ('classic')),
  CONSTRAINT games_score_valid CHECK (
    score >= 0
    AND score <= CASE mode
      -- Classic lasts 60 seconds and allows at most 20 clicks per second.
      WHEN 'classic' THEN 1200
      ELSE -1
    END
  ),
  CONSTRAINT games_timestamps_valid CHECK (ended_at >= started_at)
);

-- Leaderboard periods are based on when the score was completed.
CREATE INDEX games_mode_ended_at_idx ON games (mode, ended_at DESC);

CREATE INDEX games_user_id_started_at_idx
  ON games (user_id, started_at DESC);
