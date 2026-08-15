export const GAME_MODES = Object.freeze({
  CLASSIC: "classic",
});

export const LEADERBOARD_PERIODS = Object.freeze({
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
});

export const LEADERBOARD_TIMEZONE = "UTC";
export const LEADERBOARD_LIMIT = 10;
export const HISTORY_LIMIT = 20;

// Well below the theoretical human maximum of 60 back-to-back classic
// rounds in an hour, and far below what a script can submit. Start and
// finish each get their own 30-per-window budget so one game still costs
// one slot on each endpoint, not two.
export const GAME_RATE_LIMIT_MAX = 30;
export const GAME_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export const GAME_MODE_CONFIG = Object.freeze({
  [GAME_MODES.CLASSIC]: Object.freeze({
    durationMs: 60_000,
    maxScore: 1_200,
    // The token is issued before the 3-second countdown. Two seconds of that
    // countdown are required in addition to the full round to reject early
    // submissions without making normal timer jitter significant.
    minElapsedMs: 62_000,
    // Allows substantial response/request latency and short tab suspensions.
    maxElapsedMs: 5 * 60_000,
  }),
});

export function getGameModeConfig(mode) {
  return GAME_MODE_CONFIG[mode] ?? null;
}
