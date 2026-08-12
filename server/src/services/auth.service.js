import { randomBytes, randomInt } from "node:crypto";
import { env, isProduction } from "../config/env.js";
import { NAME_MAX_LENGTH, USERNAME_MAX_LENGTH } from "../constants/user.js";
import {
  constraints,
  isUniqueViolation,
  toApiError,
} from "../db/errors.js";
import * as userRepository from "../repositories/user.repository.js";
import { signAccessToken } from "../utils/accessToken.js";
import { ApiError } from "../utils/ApiError.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { toPublicUser } from "../utils/publicUser.js";

const USERNAME_SUFFIX_LENGTH = 3;
const MAX_USERNAME_CREATE_ATTEMPTS = 5;

function getEmailLocalPart(email) {
  return email.slice(0, email.indexOf("@"));
}

export function createNameFromEmail(email) {
  const name = getEmailLocalPart(email)
    .split(/[._+-]+/)
    .filter(Boolean)
    .map(
      (part) =>
        `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`,
    )
    .join(" ")
    .slice(0, NAME_MAX_LENGTH)
    .trim();

  return name || "Player";
}

export function createUsernameFromEmail(email, suffix) {
  const maxBaseLength = USERNAME_MAX_LENGTH - USERNAME_SUFFIX_LENGTH;
  let base = getEmailLocalPart(email)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, maxBaseLength);

  if (!/[a-z]/.test(base)) {
    base = `user${base}`.slice(0, maxBaseLength);
  }

  return `${base}${suffix.toString().padStart(USERNAME_SUFFIX_LENGTH, "0")}`;
}

export async function signUp({ email, password }) {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(password);
  const name = createNameFromEmail(email);
  let user;

  for (let attempt = 1; attempt <= MAX_USERNAME_CREATE_ATTEMPTS; attempt += 1) {
    const username = createUsernameFromEmail(email, randomInt(1000));

    try {
      user = await userRepository.create({
        email,
        username,
        name,
        passwordHash,
      });
      break;
    } catch (error) {
      const isUsernameCollision = isUniqueViolation(
        error,
        constraints.usersUsername,
      );

      if (isUsernameCollision && attempt < MAX_USERNAME_CREATE_ATTEMPTS) {
        continue;
      }

      throw toApiError(error);
    }
  }

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
