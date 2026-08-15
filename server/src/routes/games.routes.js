import { Router } from "express";
import * as gamesController from "../controllers/games.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  finishGameSchema,
  historyQuerySchema,
  leaderboardQuerySchema,
  startGameSchema,
} from "../validators/games.validators.js";

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
  validateBody(startGameSchema),
  gamesController.startGame,
);
router.post(
  "/finish",
  authenticate,
  validateBody(finishGameSchema),
  gamesController.finishGame,
);

export default router;
