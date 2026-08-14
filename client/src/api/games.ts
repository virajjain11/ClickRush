import { apiRequest } from "../lib/apiClient";
import type {
  FinishGameRequest,
  FinishGameResponse,
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
