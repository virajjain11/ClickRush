import { apiRequest } from "../lib/apiClient";
import type {
  FinishGameRequest,
  FinishGameResponse,
  GameHistoryResponse,
  GameMode,
  LeaderboardPeriod,
  LeaderboardResponse,
  StartGameRequest,
  StartGameResponse,
} from "../types/game";
import { endpoints } from "./endpoints";

export function startGame(
  values: StartGameRequest,
): Promise<StartGameResponse> {
  return apiRequest<StartGameResponse>(endpoints.games.start, {
    method: "POST",
    body: values,
    fallbackErrorMessage: "Unable to start your game",
  });
}

export function finishGame(
  values: FinishGameRequest,
): Promise<FinishGameResponse> {
  return apiRequest<FinishGameResponse>(endpoints.games.finish, {
    method: "POST",
    body: values,
    fallbackErrorMessage: "Unable to save your score",
  });
}

export function getGameHistory(
  mode: GameMode,
  signal?: AbortSignal,
): Promise<GameHistoryResponse> {
  const search = new URLSearchParams({ mode });

  return apiRequest<GameHistoryResponse>(
    `${endpoints.games.history}?${search}`,
    {
      signal,
      fallbackErrorMessage: "Unable to load your game history",
    },
  );
}

export function getLeaderboard(
  mode: GameMode,
  period: LeaderboardPeriod,
  signal?: AbortSignal,
): Promise<LeaderboardResponse> {
  const search = new URLSearchParams({ mode, period });

  return apiRequest<LeaderboardResponse>(
    `${endpoints.games.leaderboard}?${search}`,
    {
      signal,
      fallbackErrorMessage: "Unable to load the leaderboard",
    },
  );
}
