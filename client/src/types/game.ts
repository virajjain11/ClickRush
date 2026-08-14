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
