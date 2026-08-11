import { apiRequest } from "../lib/apiClient";
import type { CurrentUserResponse } from "../types/auth";
import { endpoints } from "./endpoints";

export function getCurrentUser(
  signal?: AbortSignal,
): Promise<CurrentUserResponse> {
  return apiRequest<CurrentUserResponse>(endpoints.users.me, {
    signal,
    fallbackErrorMessage: "Unable to load your profile",
  });
}
