import { useQuery } from "@tanstack/react-query";
import { getAdminGames } from "../api/admin";
import { queryKeys } from "../api/queryKeys";
import { ApiError } from "../lib/apiClient";
import { getAccessToken } from "../lib/authStorage";

const STALE_TIME_MS = 30 * 1000;
const MAX_RETRIES = 3;

export function useAdminGamesQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.admin.games,
    queryFn: ({ signal }) => getAdminGames(signal),
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: STALE_TIME_MS,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }

      return failureCount < MAX_RETRIES;
    },
  });
}
