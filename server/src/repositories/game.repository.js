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

export async function findAllWithPlayer() {
  const { rows } = await query(
    `
      SELECT
        g.id,
        u.name,
        u.username,
        g.score,
        g.ended_at AS "playedAt"
      FROM games g
      JOIN users u ON u.id = g.user_id
      ORDER BY g.ended_at DESC
    `,
  );

  return rows.map(toAdminGame);
}

function toAdminGame(row) {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    score: row.score,
    playedAt: row.playedAt.toISOString(),
  };
}

export async function findHistoryByUser({ userId, mode, limit }) {
  const { rows } = await query(
    `
      SELECT ${GAME_COLUMNS}
      FROM games
      WHERE user_id = $1 AND mode = $2
      ORDER BY started_at DESC
      LIMIT $3
    `,
    [userId, mode, limit],
  );

  return rows.map(toGame);
}

export async function summarizeByUser({ userId, mode }) {
  const { rows } = await query(
    `
      SELECT
        COUNT(*)::int AS "gamesPlayed",
        COALESCE(MAX(score), 0)::int AS "personalBest",
        COALESCE(AVG(score), 0) AS "averageScore"
      FROM games
      WHERE user_id = $1 AND mode = $2
    `,
    [userId, mode],
  );

  const summary = rows[0];

  return {
    gamesPlayed: summary.gamesPlayed,
    personalBest: summary.personalBest,
    averageScore: Number(summary.averageScore),
  };
}

export async function findPeriodBests({
  mode,
  start,
  end,
  limit,
  viewerUserId,
}) {
  const { rows } = await query(
    `
      WITH bests AS (
        SELECT DISTINCT ON (g.user_id)
          g.id,
          g.user_id,
          g.score,
          g.ended_at
        FROM games g
        WHERE g.mode = $1
          AND g.ended_at >= $2
          AND g.ended_at < $3
        ORDER BY g.user_id, g.score DESC, g.ended_at ASC, g.id ASC
      ),
      ranked AS (
        SELECT
          b.id AS "gameId",
          b.user_id AS "userId",
          u.name,
          u.username,
          b.score,
          b.ended_at AS "endedAt",
          ROW_NUMBER() OVER (
            ORDER BY b.score DESC, b.ended_at ASC, b.id ASC
          ) AS rank
        FROM bests b
        JOIN users u ON u.id = b.user_id
      )
      SELECT *
      FROM ranked
      WHERE rank <= $4 OR "userId" = $5
      ORDER BY rank ASC
    `,
    [mode, start, end, limit, viewerUserId],
  );

  return rows.map(toLeaderboardEntry);
}

function toLeaderboardEntry(row) {
  return {
    rank: Number(row.rank),
    gameId: row.gameId,
    userId: row.userId,
    name: row.name,
    username: row.username,
    score: row.score,
    endedAt: row.endedAt.toISOString(),
  };
}
