import * as userRepository from "../repositories/user.repository.js";
import {
  InvalidAccessTokenError,
  verifyAccessToken,
} from "../utils/accessToken.js";
import { ApiError } from "../utils/ApiError.js";
import { toPublicUser } from "../utils/publicUser.js";

export async function authenticate(req, res, next) {
  const authorization = req.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    throw ApiError.unauthorized("Authentication required");
  }

  let payload;

  try {
    payload = await verifyAccessToken(match[1]);
  } catch (error) {
    if (error instanceof InvalidAccessTokenError) {
      throw ApiError.unauthorized("Invalid or expired access token");
    }

    throw error;
  }

  if (typeof payload.sub !== "string") {
    throw ApiError.unauthorized("Invalid or expired access token");
  }

  const user = await userRepository.findById(payload.sub);
  if (!user) {
    throw ApiError.unauthorized("Invalid or expired access token");
  }

  req.user = toPublicUser(user);
  next();
}
