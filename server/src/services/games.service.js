import { randomUUID } from "node:crypto";
import {
  HISTORY_LIMIT,
  LEADERBOARD_LIMIT,
  LEADERBOARD_TIMEZONE,
  getGameModeConfig,
} from "../constants/game.js";
import { constraints, isUniqueViolation } from "../db/errors.js";
import * as gameRepository from "../repositories/game.repository.js";
import { ApiError } from "../utils/ApiError.js";
import {
  InvalidGameSessionTokenError,
  signGameSessionToken,
  verifyGameSessionToken,
} from "../utils/gameSessionToken.js";
import { getLeaderboardWindow } from "../utils/leaderboardWindow.js";

const INVALID_SESSION_MESSAGE = "Invalid or expired game session";

export async function startGame(userId, { mode }) {
  const config = getGameModeConfig(mode);
  if (!config) {
    throw ApiError.badRequest("Unsupported game mode");
  }

  const nonce = randomUUID();
  const startedAt = new Date().toISOString();
  const gameSessionToken = await signGameSessionToken({
    userId,
    nonce,
    mode,
    startedAt,
  });

  return {
    gameSessionToken,
    mode,
    startedAt,
    durationMs: config.durationMs,
  };
}

export async function finishGame(userId, { gameSessionToken, score }) {
  const payload = await verifySessionToken(gameSessionToken);

  if (payload.sub !== userId) {
    throw ApiError.badRequest("Game session does not belong to this user");
  }

  const session = parseSessionPayload(payload);
  const config = getGameModeConfig(session.mode);
  if (!config) {
    throw ApiError.badRequest(INVALID_SESSION_MESSAGE);
  }

  const endedAt = new Date();
  const elapsedMs = endedAt.getTime() - session.startedAtMs;

  if (elapsedMs < config.minElapsedMs) {
    throw ApiError.badRequest("Game finished too quickly");
  }

  if (elapsedMs > config.maxElapsedMs) {
    throw ApiError.badRequest("Game session took too long");
  }

  if (score > config.maxScore) {
    throw ApiError.badRequest(
      `Score exceeds the maximum for ${session.mode} mode`,
    );
  }

  try {
    const game = await gameRepository.create({
      id: session.id,
      userId,
      score,
      startedAt: session.startedAt,
      endedAt: endedAt.toISOString(),
      mode: session.mode,
    });

    return { game };
  } catch (error) {
    if (!isUniqueViolation(error, constraints.gamesPkey)) {
      throw error;
    }

    const existingGame = await gameRepository.findById(session.id);
    if (!existingGame || existingGame.userId !== userId) {
      throw ApiError.badRequest(INVALID_SESSION_MESSAGE);
    }

    return { game: existingGame };
  }
}

export async function getHistory(userId, { mode }) {
  const config = getGameModeConfig(mode);
  if (!config) {
    throw ApiError.badRequest("Unsupported game mode");
  }

  const [summary, games] = await Promise.all([
    gameRepository.summarizeByUser({ userId, mode }),
    gameRepository.findHistoryByUser({
      userId,
      mode,
      limit: HISTORY_LIMIT,
    }),
  ]);

  return {
    mode,
    durationMs: config.durationMs,
    personalBest: summary.personalBest,
    gamesPlayed: summary.gamesPlayed,
    averageScore: roundAverageScore(summary.averageScore),
    games,
  };
}

export async function getLeaderboard(userId, { mode, period }) {
  const config = getGameModeConfig(mode);
  if (!config) {
    throw ApiError.badRequest("Unsupported game mode");
  }

  const window = getLeaderboardWindow(period);
  if (!window) {
    throw ApiError.badRequest("Unsupported leaderboard period");
  }

  const rows = await gameRepository.findPeriodBests({
    mode,
    start: window.start,
    end: window.end,
    limit: LEADERBOARD_LIMIT,
    viewerUserId: userId,
  });

  const entries = rows
    .filter((row) => row.rank <= LEADERBOARD_LIMIT)
    .map((row) => toPublicLeaderboardEntry(row, userId));
  const viewerRow = rows.find((row) => row.userId === userId);

  return {
    mode,
    period,
    timezone: LEADERBOARD_TIMEZONE,
    window,
    entries,
    viewer: viewerRow ? toViewerStanding(viewerRow) : null,
  };
}

function toPublicLeaderboardEntry(row, viewerUserId) {
  return {
    rank: row.rank,
    gameId: row.gameId,
    userId: row.userId,
    name: row.name,
    username: row.username,
    score: row.score,
    endedAt: row.endedAt,
    isViewer: row.userId === viewerUserId,
  };
}

function toViewerStanding(row) {
  return {
    rank: row.rank,
    score: row.score,
    endedAt: row.endedAt,
    gameId: row.gameId,
  };
}

function roundAverageScore(value) {
  return Math.round(value * 10) / 10;
}

async function verifySessionToken(token) {
  try {
    return await verifyGameSessionToken(token);
  } catch (error) {
    if (error instanceof InvalidGameSessionTokenError) {
      throw ApiError.badRequest(INVALID_SESSION_MESSAGE);
    }

    throw error;
  }
}

function parseSessionPayload(payload) {
  if (
    typeof payload.jti !== "string" ||
    typeof payload.mode !== "string" ||
    typeof payload.startedAt !== "string"
  ) {
    throw ApiError.badRequest(INVALID_SESSION_MESSAGE);
  }

  const startedAtMs = Date.parse(payload.startedAt);
  if (!Number.isFinite(startedAtMs)) {
    throw ApiError.badRequest(INVALID_SESSION_MESSAGE);
  }

  return {
    id: payload.jti,
    mode: payload.mode,
    startedAt: payload.startedAt,
    startedAtMs,
  };
}
