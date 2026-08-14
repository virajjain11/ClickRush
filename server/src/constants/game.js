export const GAME_MODES = Object.freeze({
  CLASSIC: "classic",
});

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
