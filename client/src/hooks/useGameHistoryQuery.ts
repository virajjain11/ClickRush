import { useQuery } from "@tanstack/react-query";
import { getGameHistory } from "../api/games";
import { queryKeys } from "../api/queryKeys";
import { ApiError } from "../lib/apiClient";
import { getAccessToken } from "../lib/authStorage";
import type { GameMode } from "../types/game";

const STALE_TIME_MS = 30 * 1000;
const MAX_RETRIES = 3;

export function useGameHistoryQuery(mode: GameMode) {
  return useQuery({
    queryKey: queryKeys.games.history(mode),
    queryFn: ({ signal }) => getGameHistory(mode, signal),
    enabled: Boolean(getAccessToken()),
    staleTime: STALE_TIME_MS,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }

      return failureCount < MAX_RETRIES;
    },
  });
}
