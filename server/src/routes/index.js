import { Router } from "express";
import authRoutes from "./auth.routes.js";
import gamesRoutes from "./games.routes.js";
import usersRoutes from "./users.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/games", gamesRoutes);
router.use("/users", usersRoutes);

export default router;
