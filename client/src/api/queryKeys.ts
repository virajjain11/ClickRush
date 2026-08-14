import type { GameMode } from "../types/game";

export const queryKeys = {
  games: {
    all: ["games"] as const,
    personalBest: (mode: GameMode) =>
      ["games", "personal-best", mode] as const,
  },
  users: {
    me: ["users", "me"] as const,
  },
} as const;
