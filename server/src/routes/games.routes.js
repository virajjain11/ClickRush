import { Router } from "express";
import {
  GAME_RATE_LIMIT_MAX,
  GAME_RATE_LIMIT_WINDOW_MS,
} from "../constants/game.js";
import * as gamesController from "../controllers/games.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  finishGameSchema,
  historyQuerySchema,
  leaderboardQuerySchema,
  startGameSchema,
} from "../validators/games.validators.js";

const startGameRateLimit = createRateLimiter({
  windowMs: GAME_RATE_LIMIT_WINDOW_MS,
  max: GAME_RATE_LIMIT_MAX,
  message: "Too many games started. Try again later.",
});

const finishGameRateLimit = createRateLimiter({
  windowMs: GAME_RATE_LIMIT_WINDOW_MS,
  max: GAME_RATE_LIMIT_MAX,
  message: "Too many scores submitted. Try again later.",
});

const router = Router();

router.get(
  "/history",
  authenticate,
  validateQuery(historyQuerySchema),
  gamesController.getHistory,
);
router.get(
  "/leaderboard",
  authenticate,
  validateQuery(leaderboardQuerySchema),
  gamesController.getLeaderboard,
);
router.post(
  "/",
  authenticate,
  startGameRateLimit,
  validateBody(startGameSchema),
  gamesController.startGame,
);
router.post(
  "/finish",
  authenticate,
  finishGameRateLimit,
  validateBody(finishGameSchema),
  gamesController.finishGame,
);

export default router;
