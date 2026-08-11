import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import type { AuthResponse } from "../types/auth";
import { clearAccessToken, setAccessToken } from "./authStorage";

export function startSession(
  queryClient: QueryClient,
  { user, accessToken }: AuthResponse,
): void {
  setAccessToken(accessToken);
  queryClient.setQueryData(queryKeys.users.me, { user });
}

export function endSession(queryClient: QueryClient): void {
  clearAccessToken();
  queryClient.removeQueries({ queryKey: queryKeys.users.me });
}
