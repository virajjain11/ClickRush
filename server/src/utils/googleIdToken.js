import { createRemoteJWKSet, errors, jwtVerify } from "jose";
import { env } from "../config/env.js";

const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const googleJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

export class InvalidGoogleIdTokenError extends Error {
  constructor() {
    super("Invalid Google credential");
    this.name = "InvalidGoogleIdTokenError";
  }
}

export async function verifyGoogleIdToken(idToken) {
  if (!env.googleClientId) {
    throw new Error("GOOGLE_CLIENT_ID must be configured");
  }

  try {
    const { payload } = await jwtVerify(idToken, googleJwks, {
      issuer: GOOGLE_ISSUERS,
      audience: env.googleClientId,
    });

    return payload;
  } catch (error) {
    if (error instanceof errors.JOSEError) {
      throw new InvalidGoogleIdTokenError();
    }

    throw error;
  }
}
