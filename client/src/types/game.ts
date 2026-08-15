export type GameMode = "classic";

export type Game = {
  id: string;
  userId: string;
  score: number;
  startedAt: string;
  endedAt: string;
  mode: GameMode;
};

export type StartGameRequest = {
  mode: GameMode;
};

export type StartGameResponse = {
  gameSessionToken: string;
  mode: GameMode;
  startedAt: string;
  durationMs: number;
};

export type FinishGameRequest = {
  gameSessionToken: string;
  score: number;
};

export type FinishGameResponse = {
  game: Game;
};

export type LeaderboardPeriod = "daily" | "weekly" | "monthly";

export type GameHistoryResponse = {
  mode: GameMode;
  durationMs: number;
  personalBest: number;
  gamesPlayed: number;
  averageScore: number;
  games: Game[];
};

export type LeaderboardEntry = {
  rank: number;
  gameId: string;
  userId: string;
  name: string;
  username: string;
  score: number;
  endedAt: string;
  isViewer: boolean;
};

export type LeaderboardViewer = {
  rank: number;
  score: number;
  endedAt: string;
  gameId: string;
};

export type LeaderboardResponse = {
  mode: GameMode;
  period: LeaderboardPeriod;
  timezone: "UTC";
  window: {
    start: string;
    end: string;
  };
  entries: LeaderboardEntry[];
  viewer: LeaderboardViewer | null;
};
