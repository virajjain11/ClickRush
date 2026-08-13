import { ApiError } from "../utils/ApiError.js";

const UNIQUE_VIOLATION = "23505";

/**
 * Names Postgres gives unique constraints used by service-level recovery.
 * Collisions all arrive as code 23505, so callers have to compare the
 * constraint name. Keep in step with the migrations.
 */
export const constraints = {
  gamesPkey: "games_pkey",
  usersEmail: "users_email_key",
  usersUsername: "users_username_key",
};

const conflictMessagesByConstraint = new Map([
  [constraints.usersEmail, "An account with this email already exists"],
  [constraints.usersUsername, "That username is already taken"],
]);

export function isUniqueViolation(error, constraint) {
  return error?.code === UNIQUE_VIOLATION && error.constraint === constraint;
}

/**
 * Translates a `pg` error into an `ApiError` where the cause is something the
 * client can act on. Anything unrecognised is returned unchanged so it reaches
 * `errorHandler` as a logged 500 rather than being flattened into a misleading
 * 4xx.
 */
export function toApiError(error) {
  if (error?.code === UNIQUE_VIOLATION) {
    const message = conflictMessagesByConstraint.get(error.constraint);

    if (message) {
      return ApiError.conflict(message);
    }
  }

  return error;
}
