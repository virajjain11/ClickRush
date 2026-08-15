import { ApiError } from "../utils/ApiError.js";

function defaultUserKey(req) {
  return req.user?.id ?? null;
}

// In-memory sliding window, keyed by the authenticated user rather than
// the IP. The attack this exists to stop is one account minting many
// sessions and submitting them together; an IP key would also punish
// honest players behind a shared NAT.
//
// The increment happens before `next()` so concurrent requests in this
// process cannot all pass the check. The store is per process and resets
// on restart, which is enough while the API is a single Node instance.
export function createRateLimiter({
  windowMs,
  max,
  message = "Too many requests",
  keyFn = defaultUserKey,
}) {
  const hits = new Map();

  function rateLimit(req, res, next) {
    const key = keyFn(req);
    if (typeof key !== "string" || key.length === 0) {
      throw ApiError.unauthorized("Authentication required");
    }

    const now = Date.now();
    const windowStart = now - windowMs;
    const timestamps = (hits.get(key) ?? []).filter((at) => at > windowStart);

    if (timestamps.length >= max) {
      const retryAfterMs = timestamps[0] + windowMs - now;
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
      res.set("Retry-After", String(retryAfterSeconds));
      throw ApiError.tooManyRequests(message);
    }

    timestamps.push(now);
    hits.set(key, timestamps);
    next();
  }

  return rateLimit;
}
