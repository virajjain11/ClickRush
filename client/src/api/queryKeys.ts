import type { GameMode, LeaderboardPeriod } from "../types/game";

export const queryKeys = {
  games: {
    all: ["games"] as const,
    history: (mode: GameMode) => ["games", "history", mode] as const,
    leaderboard: (mode: GameMode, period: LeaderboardPeriod) =>
      ["games", "leaderboard", mode, period] as const,
    personalBest: (mode: GameMode) =>
      ["games", "personal-best", mode] as const,
  },
  users: {
    me: ["users", "me"] as const,
  },
} as const;
