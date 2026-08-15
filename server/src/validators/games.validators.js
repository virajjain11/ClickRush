import { z } from "zod";
import { GAME_MODES, LEADERBOARD_PERIODS } from "../constants/game.js";

const gameModeSchema = z
  .literal(GAME_MODES.CLASSIC)
  .default(GAME_MODES.CLASSIC);

export const startGameSchema = z.object({
  mode: gameModeSchema,
});

export const historyQuerySchema = z.object({
  mode: gameModeSchema,
});

export const leaderboardQuerySchema = z.object({
  mode: gameModeSchema,
  period: z
    .enum([
      LEADERBOARD_PERIODS.DAILY,
      LEADERBOARD_PERIODS.WEEKLY,
      LEADERBOARD_PERIODS.MONTHLY,
    ])
    .default(LEADERBOARD_PERIODS.DAILY),
});

export const finishGameSchema = z.object({
  gameSessionToken: z.string().min(1, "Game session token is required"),
  score: z
    .number()
    .int("Score must be a whole number")
    .nonnegative("Score cannot be negative"),
});
