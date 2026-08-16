import { query } from "../db/index.js";

const USER_COLUMNS = `
  id,
  email,
  username,
  name,
  password_hash AS "passwordHash",
  google_sub AS "googleSub",
  role,
  password_reset_token AS "passwordResetToken",
  password_reset_token_expires_at AS "passwordResetTokenExpiresAt",
  created_at AS "createdAt"
`;

function toUser(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    passwordResetTokenExpiresAt:
      row.passwordResetTokenExpiresAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function findByEmail(email) {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS} FROM users WHERE email = $1`,
    [email],
  );

  return toUser(rows[0]);
}

export async function findById(id) {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
    [id],
  );

  return toUser(rows[0]);
}

export async function findByUsername(username) {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS} FROM users WHERE username = $1`,
    [username],
  );

  return toUser(rows[0]);
}

export async function findByGoogleSub(googleSub) {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS} FROM users WHERE google_sub = $1`,
    [googleSub],
  );

  return toUser(rows[0]);
}

export async function create({
  email,
  username,
  name,
  passwordHash = null,
  googleSub = null,
}) {
  const { rows } = await query(
    `
      INSERT INTO users (email, username, name, password_hash, google_sub)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ${USER_COLUMNS}
    `,
    [email, username, name, passwordHash, googleSub],
  );

  return toUser(rows[0]);
}

export async function updateName(id, name) {
  const { rows } = await query(
    `
      UPDATE users
      SET name = $2
      WHERE id = $1
      RETURNING ${USER_COLUMNS}
    `,
    [id, name],
  );

  return toUser(rows[0]);
}

export async function linkGoogleSub(id, googleSub) {
  const { rows } = await query(
    `
      UPDATE users
      SET google_sub = $2
      WHERE id = $1 AND google_sub IS NULL
      RETURNING ${USER_COLUMNS}
    `,
    [id, googleSub],
  );

  return toUser(rows[0]);
}

export async function setPasswordResetToken(
  id,
  passwordResetToken,
  passwordResetTokenExpiresAt,
) {
  const { rows } = await query(
    `
      UPDATE users
      SET
        password_reset_token = $2,
        password_reset_token_expires_at = $3
      WHERE id = $1
      RETURNING ${USER_COLUMNS}
    `,
    [id, passwordResetToken, passwordResetTokenExpiresAt],
  );

  return toUser(rows[0]);
}

export async function updatePassword(id, passwordHash) {
  const { rows } = await query(
    `
      UPDATE users
      SET
        password_hash = $2,
        password_reset_token = NULL,
        password_reset_token_expires_at = NULL
      WHERE id = $1
      RETURNING ${USER_COLUMNS}
    `,
    [id, passwordHash],
  );

  return toUser(rows[0]);
}
