import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import { validateBody } from "../middleware/validate.js";
import {
  forgotPasswordSchema,
  googleAuthSchema,
  signInSchema,
  signUpSchema,
} from "../validators/auth.validators.js";

const googleAuthRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many sign-in attempts. Try again later.",
  keyFn: (req) => req.ip || req.socket?.remoteAddress || "unknown",
});

const router = Router();

router.post("/sign-up", validateBody(signUpSchema), authController.signUp);
router.post("/sign-in", validateBody(signInSchema), authController.signIn);
router.post(
  "/google",
  googleAuthRateLimit,
  validateBody(googleAuthSchema),
  authController.signInWithGoogle,
);
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);

export default router;
