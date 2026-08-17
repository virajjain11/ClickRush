import { Router } from "express";
import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";
import gamesRoutes from "./games.routes.js";
import usersRoutes from "./users.routes.js";

const router = Router();

router.use("/admin", adminRoutes);
router.use("/auth", authRoutes);
router.use("/games", gamesRoutes);
router.use("/users", usersRoutes);

export default router;
