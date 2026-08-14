import { z } from "zod";
import { GAME_MODES } from "../constants/game.js";

export const startGameSchema = z.object({
  mode: z.literal(GAME_MODES.CLASSIC).default(GAME_MODES.CLASSIC),
});

export const finishGameSchema = z.object({
  gameSessionToken: z.string().min(1, "Game session token is required"),
  score: z
    .number()
    .int("Score must be a whole number")
    .nonnegative("Score cannot be negative"),
});
