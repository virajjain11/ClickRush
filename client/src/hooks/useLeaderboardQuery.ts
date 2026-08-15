import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "../api/games";
import { queryKeys } from "../api/queryKeys";
import { ApiError } from "../lib/apiClient";
import { getAccessToken } from "../lib/authStorage";
import type { GameMode, LeaderboardPeriod } from "../types/game";

const STALE_TIME_MS = 30 * 1000;
const MAX_RETRIES = 3;

export function useLeaderboardQuery(
  mode: GameMode,
  period: LeaderboardPeriod,
) {
  return useQuery({
    queryKey: queryKeys.games.leaderboard(mode, period),
    queryFn: ({ signal }) => getLeaderboard(mode, period, signal),
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
