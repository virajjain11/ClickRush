import { isProduction } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const isApiError = error instanceof ApiError;
  // Errors thrown by express.json() and other http-errors producers already
  // carry a client-safe status and message.
  const isExposedHttpError =
    !isApiError && error.expose === true && Number.isInteger(error.status);

  const isKnownError = isApiError || isExposedHttpError;
  const statusCode = isApiError
    ? error.statusCode
    : isExposedHttpError
      ? error.status
      : 500;
  const message = isKnownError ? error.message : "Internal server error";

  if (!isKnownError) {
    console.error(error);
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(isApiError && error.details ? { details: error.details } : {}),
      ...(!isProduction && !isKnownError ? { stack: error.stack } : {}),
    },
  });
}
