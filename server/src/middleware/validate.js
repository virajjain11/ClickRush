import { ApiError } from "../utils/ApiError.js";

// middleware to validate req.body using a Zod schema.
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      }));

      next(ApiError.badRequest("Validation failed", details));
      return;
    }

    req.body = result.data;
    next();
  };
}
