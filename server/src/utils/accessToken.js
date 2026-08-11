import { SignJWT, errors, jwtVerify } from "jose";
import { env } from "../config/env.js";

const algorithm = "HS256";
const textEncoder = new TextEncoder();

export class InvalidAccessTokenError extends Error {
  constructor() {
    super("Invalid or expired access token");
    this.name = "InvalidAccessTokenError";
  }
}

function getSigningSecret() {
  if (!env.jwtAccessTokenSecret) {
    throw new Error("JWT_ACCESS_TOKEN_SECRET must be configured");
  }

  return textEncoder.encode(env.jwtAccessTokenSecret);
}

export async function signAccessToken(userId) {
  return new SignJWT({})
    .setProtectedHeader({ alg: algorithm })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(env.jwtAccessTokenTtl)
    .sign(getSigningSecret());
}

export async function verifyAccessToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSigningSecret(), {
      algorithms: [algorithm],
    });

    return payload;
  } catch (error) {
    if (error instanceof errors.JOSEError) {
      throw new InvalidAccessTokenError();
    }

    throw error;
  }
}
