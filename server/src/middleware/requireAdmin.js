import { USER_ROLES } from "../constants/user.js";
import { ApiError } from "../utils/ApiError.js";

export function requireAdmin(req, res, next) {
  if (req.user?.role !== USER_ROLES.ADMIN) {
    throw ApiError.forbidden("Admin access required");
  }

  next();
}
