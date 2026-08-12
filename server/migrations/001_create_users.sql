CREATE TABLE users (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text        NOT NULL UNIQUE,
  username      text        NOT NULL UNIQUE,
  name          text        NOT NULL,
  password_hash text        NOT NULL,
  role          text        NOT NULL DEFAULT 'user',
  created_at    timestamptz NOT NULL DEFAULT now(),

  -- Parity port of the current in-memory fields. Raw value, no index: the reset
  -- feature is unbuilt and nothing reads these yet. Hash before anything does.
  password_reset_token            text,
  password_reset_token_expires_at timestamptz,

  CONSTRAINT users_email_lowercase CHECK (email = lower(email)),
  CONSTRAINT users_username_valid CHECK (
    username ~ '^[a-z0-9_]{3,20}$' AND username ~ '[a-z]'
  ),
  CONSTRAINT users_name_valid CHECK (char_length(name) BETWEEN 1 AND 50),
  CONSTRAINT users_role_valid CHECK (role IN ('user', 'admin'))
);
