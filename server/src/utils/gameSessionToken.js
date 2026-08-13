import { SignJWT, errors, jwtVerify } from "jose";
import { env } from "../config/env.js";

const algorithm = "HS256";
const textEncoder = new TextEncoder();

export class InvalidGameSessionTokenError extends Error {
  constructor() {
    super("Invalid or expired game session");
    this.name = "InvalidGameSessionTokenError";
  }
}

function getSigningSecret() {
  if (!env.jwtGameSessionSecret) {
    throw new Error("JWT_GAME_SESSION_SECRET must be configured");
  }

  return textEncoder.encode(env.jwtGameSessionSecret);
}

export async function signGameSessionToken({
  userId,
  nonce,
  mode,
  startedAt,
}) {
  return new SignJWT({ mode, startedAt })
    .setProtectedHeader({ alg: algorithm })
    .setSubject(userId)
    .setJti(nonce)
    .setIssuedAt()
    .setExpirationTime(env.jwtGameSessionTtl)
    .sign(getSigningSecret());
}

export async function verifyGameSessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSigningSecret(), {
      algorithms: [algorithm],
    });

    return payload;
  } catch (error) {
    if (error instanceof errors.JOSEError) {
      throw new InvalidGameSessionTokenError();
    }

    throw error;
  }
}
