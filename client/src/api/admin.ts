import { apiRequest } from "../lib/apiClient";
import type { AdminGamesResponse, AdminUsersResponse } from "../types/admin";
import { endpoints } from "./endpoints";

export function getAdminUsers(
  signal?: AbortSignal,
): Promise<AdminUsersResponse> {
  return apiRequest<AdminUsersResponse>(endpoints.admin.users, {
    signal,
    fallbackErrorMessage: "Unable to load users",
  });
}

export function getAdminGames(
  signal?: AbortSignal,
): Promise<AdminGamesResponse> {
  return apiRequest<AdminGamesResponse>(endpoints.admin.games, {
    signal,
    fallbackErrorMessage: "Unable to load games",
  });
}
