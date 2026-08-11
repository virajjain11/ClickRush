import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { getCurrentUser } from "../api/users";
import { ApiError } from "../lib/apiClient";
import { getAccessToken } from "../lib/authStorage";

const STALE_TIME_MS = 5 * 60 * 1000;
const MAX_RETRIES = 3;

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: ({ signal }) => getCurrentUser(signal),
    select: (data) => data.user,
    enabled: Boolean(getAccessToken()),
    staleTime: STALE_TIME_MS,
    // A rejected or expired token fails the same way on every attempt.
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }

      return failureCount < MAX_RETRIES;
    },
  });
}
