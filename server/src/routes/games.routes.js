import { Router } from "express";
import * as gamesController from "../controllers/games.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validate.js";
import {
  finishGameSchema,
  startGameSchema,
} from "../validators/games.validators.js";

const router = Router();

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
