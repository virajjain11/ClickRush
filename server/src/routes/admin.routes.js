import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/users", adminController.listUsers);
router.get("/games", adminController.listGames);

export default router;
