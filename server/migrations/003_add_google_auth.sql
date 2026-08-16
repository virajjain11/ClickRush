-- Google-only accounts have no password. Existing password users keep their
-- hash. A user must have at least one credential so a row cannot be created
-- that nobody can sign in as.
ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL,
  ADD COLUMN google_sub text UNIQUE;

ALTER TABLE users
  ADD CONSTRAINT users_has_credential CHECK (
    password_hash IS NOT NULL OR google_sub IS NOT NULL
  );
