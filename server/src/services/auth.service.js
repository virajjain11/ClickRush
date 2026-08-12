import { randomBytes, randomInt } from "node:crypto";
import { env, isProduction } from "../config/env.js";
import * as userRepository from "../repositories/user.repository.js";
import { signAccessToken } from "../utils/accessToken.js";
import { ApiError } from "../utils/ApiError.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { toPublicUser } from "../utils/publicUser.js";

export async function signUp({ email, password }) {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(password);
  const emailName = email.slice(0, email.indexOf("@"));
  const randomSuffix = randomInt(1000).toString().padStart(3, "0");
  const name = `${emailName}${randomSuffix}`; // Will this generate any existing names? need to check
  const user = await userRepository.create({ email, name, passwordHash });
  const accessToken = await signAccessToken(user.id);

  return { user: toPublicUser(user), accessToken };
}

export async function signIn({ email, password }) {
  const user = await userRepository.findByEmail(email);

  // Same error for unknown email and wrong password, so the response cannot be
  // used to discover which emails are registered.
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const accessToken = await signAccessToken(user.id);

  return { user: toPublicUser(user), accessToken };
}

export async function requestPasswordReset({ email }) {
  const user = await userRepository.findByEmail(email);

  if (user) {
    const passwordResetToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + env.passwordResetTokenTtlMinutes * 60 * 1000,
    ).toISOString();

    await userRepository.setPasswordResetToken(
      user.id,
      passwordResetToken,
      expiresAt,
    );

    if (!isProduction) {
      console.log(
        `[auth] password reset token for ${email}: ${passwordResetToken}`,
      );
    }
  }
}
