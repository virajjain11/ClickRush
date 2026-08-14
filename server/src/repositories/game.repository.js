import { query } from "../db/index.js";

const GAME_COLUMNS = `
  id,
  user_id AS "userId",
  score,
  started_at AS "startedAt",
  ended_at AS "endedAt",
  mode
`;

function toGame(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    startedAt: row.startedAt.toISOString(),
    endedAt: row.endedAt.toISOString(),
  };
}

export async function findById(id) {
  const { rows } = await query(
    `SELECT ${GAME_COLUMNS} FROM games WHERE id = $1`,
    [id],
  );

  return toGame(rows[0]);
}

export async function create({
  id,
  userId,
  score,
  startedAt,
  endedAt,
  mode,
}) {
  const { rows } = await query(
    `
      INSERT INTO games (id, user_id, score, started_at, ended_at, mode)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING ${GAME_COLUMNS}
    `,
    [id, userId, score, startedAt, endedAt, mode],
  );

  return toGame(rows[0]);
}
