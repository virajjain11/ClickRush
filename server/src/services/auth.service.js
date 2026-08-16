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
import {
  InvalidGoogleIdTokenError,
  verifyGoogleIdToken,
} from "../utils/googleIdToken.js";
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
  const user = await createUserWithUniqueUsername({
    email,
    name: createNameFromEmail(email),
    passwordHash,
  });

  return issueSession(user);
}

export async function signIn({ email, password }) {
  const user = await userRepository.findByEmail(email);

  // Same error for unknown email and wrong password, so the response cannot be
  // used to discover which emails are registered.
  if (!user || !user.passwordHash) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  return issueSession(user);
}

export async function signInWithGoogle({ idToken }) {
  if (!env.googleClientId) {
    throw ApiError.badRequest("Google sign-in is not configured");
  }

  const profile = await readGoogleProfile(idToken);
  const existingBySub = await userRepository.findByGoogleSub(profile.sub);
  if (existingBySub) {
    return issueSession(await applyGoogleName(existingBySub, profile.name));
  }

  const existingByEmail = await userRepository.findByEmail(profile.email);
  if (existingByEmail) {
    const linked =
      existingByEmail.googleSub === profile.sub
        ? existingByEmail
        : await linkGoogleAccount(existingByEmail, profile.sub);

    return issueSession(await applyGoogleName(linked, profile.name));
  }

  const user = await createUserWithUniqueUsername({
    email: profile.email,
    name: profile.name || createNameFromEmail(profile.email),
    googleSub: profile.sub,
  });

  return issueSession(user);
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

async function issueSession(user) {
  const accessToken = await signAccessToken(user.id);

  return { user: toPublicUser(user), accessToken };
}

async function createUserWithUniqueUsername({
  email,
  name,
  passwordHash = null,
  googleSub = null,
}) {
  for (let attempt = 1; attempt <= MAX_USERNAME_CREATE_ATTEMPTS; attempt += 1) {
    const username = createUsernameFromEmail(email, randomInt(1000));

    try {
      return await userRepository.create({
        email,
        username,
        name,
        passwordHash,
        googleSub,
      });
    } catch (error) {
      if (googleSub && isUniqueViolation(error, constraints.usersGoogleSub)) {
        const existing = await userRepository.findByGoogleSub(googleSub);
        if (existing) {
          return existing;
        }
      }

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

  throw ApiError.conflict("That username is already taken");
}

async function readGoogleProfile(idToken) {
  let payload;

  try {
    payload = await verifyGoogleIdToken(idToken);
  } catch (error) {
    if (error instanceof InvalidGoogleIdTokenError) {
      throw ApiError.unauthorized("Invalid Google credential");
    }

    throw error;
  }

  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const emailVerified =
    payload.email_verified === true || payload.email_verified === "true";

  if (!email || typeof payload.sub !== "string" || payload.sub.length === 0) {
    throw ApiError.unauthorized("Invalid Google credential");
  }

  if (!emailVerified) {
    throw ApiError.badRequest("Google email is not verified");
  }

  return {
    sub: payload.sub,
    email,
    name: readGoogleDisplayName(payload),
  };
}

function readGoogleDisplayName(payload) {
  const fullName = asTrimmedString(payload.name);
  if (fullName) {
    return fullName.slice(0, NAME_MAX_LENGTH);
  }

  const givenName = asTrimmedString(payload.given_name);
  const familyName = asTrimmedString(payload.family_name);
  const combined = `${givenName} ${familyName}`.trim();

  return combined.slice(0, NAME_MAX_LENGTH);
}

function asTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function applyGoogleName(user, name) {
  if (!name || user.name === name) {
    return user;
  }

  return (await userRepository.updateName(user.id, name)) ?? user;
}

async function linkGoogleAccount(user, googleSub) {
  if (user.googleSub) {
    if (user.googleSub === googleSub) {
      return user;
    }

    throw ApiError.conflict("An account with this email already exists");
  }

  try {
    const linked = await userRepository.linkGoogleSub(user.id, googleSub);
    return linked ?? (await userRepository.findById(user.id)) ?? user;
  } catch (error) {
    if (isUniqueViolation(error, constraints.usersGoogleSub)) {
      const existing = await userRepository.findByGoogleSub(googleSub);
      if (existing) {
        return existing;
      }
    }

    throw toApiError(error);
  }
}
