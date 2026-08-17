// Keep these in step with the checks in 001_create_users.sql.
export const NAME_MAX_LENGTH = 50;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

export const USER_ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
});
